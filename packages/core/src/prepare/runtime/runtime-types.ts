/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import type { ExtractorResult } from "@microsoft/api-extractor";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { removeDirectory } from "@stryke/fs/helpers";
import { listFiles } from "@stryke/fs/list-files";
import { readFile } from "@stryke/fs/read-file";
import { removeFile } from "@stryke/fs/remove-file";
import {
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { replacePath } from "@stryke/path/replace";
import { resolvePackage } from "@stryke/path/resolve";
import { TsConfigJson } from "@stryke/types/tsconfig";
import defu from "defu";
import ts from "typescript";
import { readDotenvReflection } from "../../helpers/dotenv/persistence";
import { getParsedTypeScriptConfig } from "../../helpers/typescript/tsconfig";
import { getFileHeader } from "../../helpers/utilities/file-header";
import { writeFile } from "../../helpers/utilities/write-file";
import { Context, Options } from "../../types/build";
import { LogFn } from "../../types/config";

/**
 * Generates runtime types for the given context.
 *
 * @remarks
 * This function compiles TypeScript files, extracts type information, and generates declaration files using API Extractor.
 *
 * @param log - The logging function to use for output.
 * @param context - The context containing options and environment paths.
 * @returns A promise that resolves when the generation is complete.
 */
export async function generateRuntimeTypes<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>
) {
  const transformedRuntimePath = joinPaths(
    context.artifactsPath,
    "transformed"
  );
  const dtsPath = joinPaths(context.artifactsPath, "dts");
  const dtsFile = context.options.dts
    ? context.options.dts.startsWith(context.workspaceConfig.workspaceRoot)
      ? context.options.dts
      : joinPaths(context.workspaceConfig.workspaceRoot, context.options.dts)
    : joinPaths(
        context.workspaceConfig.workspaceRoot,
        context.options.projectRoot,
        "storm.d.ts"
      );

  await removeDirectory(transformedRuntimePath);
  await removeDirectory(dtsPath);
  await removeFile(dtsFile);

  await Promise.all(
    (await listFiles(joinPaths(context.runtimePath, "**/*.ts"))).map(
      async fileName =>
        writeFile(
          log,
          joinPaths(
            transformedRuntimePath,
            replacePath(fileName, context.runtimePath)
          ),
          await context.compiler.transform(
            context,
            fileName,
            await readFile(fileName),
            {
              skipErrorsTransform: true
            }
          )
        )
    )
  );

  const typescriptPath = await resolvePackage("typescript");
  if (!typescriptPath) {
    throw new Error("Could not resolve TypeScript package location.");
  }

  const typescriptLibs = await listFiles(
    joinPaths(typescriptPath, "lib", "**", "lib.*.d.ts")
  );
  if (typescriptLibs.length === 0) {
    throw new Error("No TypeScript library files found.");
  }

  const resolvedTsconfig = await getParsedTypeScriptConfig(
    context.options.projectRoot,
    context.tsconfig.tsconfigFilePath,
    defu(
      {
        compilerOptions: {
          strict: false,
          noEmit: false,
          emitDeclarationOnly: true,
          declaration: true,
          declarationMap: false
        }
      },
      context.options.tsconfigRaw ?? {}
    ) as TsConfigJson,
    [
      joinPaths(
        relativePath(
          findFilePath(dtsFile),
          joinPaths(
            context.workspaceConfig.workspaceRoot,
            context.options.projectRoot
          )
        ),
        findFileName(dtsFile)
      )
    ]
  );
  resolvedTsconfig.options.configFilePath = joinPaths(
    context.workspaceConfig.workspaceRoot,
    context.tsconfig.tsconfigFilePath
  );
  resolvedTsconfig.options.pathsBasePath =
    context.workspaceConfig.workspaceRoot;

  let fileNames = typescriptLibs.reduce(
    (ret, fileName) => {
      if (!ret.includes(fileName)) {
        ret.push(fileName);
      }

      return ret;
    },
    await listFiles(joinPaths(transformedRuntimePath, "*.ts"))
  );

  if (context.additionalRuntimeFiles?.length) {
    for (const additionalRuntimeFile of context.additionalRuntimeFiles) {
      const absoluteAdditionalRuntimeFile = joinPaths(
        context.workspaceConfig.workspaceRoot,
        additionalRuntimeFile
      );
      if (absoluteAdditionalRuntimeFile.includes("*")) {
        fileNames = fileNames.reduce(
          (ret, fileName) => {
            if (!ret.includes(fileName)) {
              ret.push(fileName);
            }

            return ret;
          },
          await listFiles(absoluteAdditionalRuntimeFile)
        );
      } else if (fileNames.includes(absoluteAdditionalRuntimeFile)) {
        fileNames.push(absoluteAdditionalRuntimeFile);
      }
    }
  }

  const program: ts.Program = ts.createProgram(
    fileNames.map(fileName =>
      fileName
        .replace(context.workspaceConfig.workspaceRoot, "")
        .replace(/^\//, "")
    ),
    resolvedTsconfig.options,
    ts.createCompilerHost(resolvedTsconfig.options)
  );

  let runtimeModules = "";
  const emitResult = program.emit(
    undefined,
    (fileName, text, writeByteOrderMark, onError, sourceFiles, _data) => {
      const sourceFile = sourceFiles?.[0];

      if (sourceFile?.fileName && !fileName.endsWith(".map")) {
        const sourceFileName = joinPaths(
          context.workspaceConfig.workspaceRoot,
          replacePath(
            sourceFile.fileName,
            context.workspaceConfig.workspaceRoot
          )
        );

        if (
          sourceFileName.includes(transformedRuntimePath) &&
          findFileName(sourceFileName, {
            withExtension: false
          }) !== "config"
        ) {
          runtimeModules += `
declare module 'storm:${relativePath(
            transformedRuntimePath,
            sourceFileName
          ).replace(/\.tsx?$/, "")}' {
    ${text.trim()}
}
`;
        }
      }
    },
    undefined,
    true
  );

  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);
  const diagnosticMessages: string[] = [];

  diagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      diagnosticMessages.push(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      diagnosticMessages.push(message);
    }
  });

  const diagnosticMessage = diagnosticMessages.join("\n");
  if (diagnosticMessage) {
    throw new Error(`TypeScript compilation failed: \n\n${diagnosticMessage}`);
  }

  const mainEntryPointFilePath = process.env.STORM_STACK_LOCAL
    ? joinPaths(context.workspaceConfig.workspaceRoot, "dist/packages/types")
    : await resolvePackage("@storm-stack/types");
  if (!mainEntryPointFilePath) {
    throw new Error("Could not resolve @storm-stack/types package location.");
  }

  const extractorResult: ExtractorResult = Extractor.invoke(
    ExtractorConfig.prepare({
      configObject: {
        mainEntryPointFilePath: joinPaths(
          mainEntryPointFilePath,
          "dist/esm/src/index.d.ts"
        ),
        apiReport: {
          enabled: false,

          // `reportFileName` is not been used. It's just to fit the requirement of API Extractor.
          reportFileName: "report.api.md"
        },
        docModel: { enabled: false },
        dtsRollup: {
          enabled: true,
          untrimmedFilePath: joinPaths(dtsPath, "storm-stack.d.ts")
        },
        tsdocMetadata: { enabled: false },
        compiler: {
          tsconfigFilePath: relativePath(
            joinPaths(
              context.workspaceConfig.workspaceRoot,
              context.options.projectRoot
            ),
            joinPaths(
              context.workspaceConfig.workspaceRoot,
              context.tsconfig.tsconfigFilePath
            )
          )
        },
        projectFolder: joinPaths(
          context.workspaceConfig.workspaceRoot,
          context.options.projectRoot
        ),
        newlineKind: "lf"
      },
      configObjectFullPath: undefined,
      packageJsonFullPath: joinPaths(
        context.workspaceConfig.workspaceRoot,
        context.options.projectRoot,
        "package.json"
      )
    }),
    {
      localBuild: true,
      showVerboseMessages: true
    }
  );
  if (!extractorResult.succeeded) {
    throw new Error(
      `API Extractor completed with ${extractorResult.errorCount} errors and ${
        extractorResult.warningCount
      } warnings when processing @storm-stack/types package.`
    );
  }

  const dotenvReflection = await readDotenvReflection(context, "config");

  await writeFile(
    log,
    dtsFile,
    `${getFileHeader(null, false)}

${(await readFile(joinPaths(dtsPath, "storm-stack.d.ts")))
  .replace(/export.*__Ω.*;/g, "")
  .replace(/^export\s*\{\s*\}\s*$/gm, "")
  .replace(/^export\s*(?:declare\s*)?/gm, "")
  .replace(
    /: Storage(?:_\d+)?;$/gm,
    ': import("unstorage").Storage<import("unstorage").StorageValue>;'
  )}

type StormVariables = Omit<StormBaseConfig, ${dotenvReflection
      .getProperties()
      .filter(item => item.isHidden() || item.isIgnored() || item.isReadonly())
      .map(prop => `"${prop.getNameAsString()}"`)
      .join(" | ")}> & Readonly<Pick<StormBaseConfig, ${dotenvReflection
      .getProperties()
      .filter(
        item => !item.isHidden() && !item.isIgnored() && item.isReadonly()
      )
      .map(prop => `"${prop.getNameAsString()}"`)
      .join(" | ")}>>;
const $storm: StormContext<StormVariables>;

${runtimeModules.replace(/^export\s*(?:declare\s*)?/gm, "export ")}`
      .replace(
        // eslint-disable-next-line regexp/no-super-linear-backtracking
        /import\s*(?:type\s*)?\{?[\w,\s]*(?:\}\s*)?from\s*(?:'|")@?[a-zA-Z0-9-\\/.]*(?:'|");?/g,
        ""
      )
      .replaceAll("#private;", "")
  );
}
