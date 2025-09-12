/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import type { ExtractorResult } from "@microsoft/api-extractor";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { resolvePackage } from "@stryke/fs/resolve";
import { relativePath } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { replacePath } from "@stryke/path/replace";
import { TsConfigJson } from "@stryke/types/tsconfig";
import defu from "defu";
import { existsSync } from "node:fs";
import {
  createCompilerHost,
  createProgram,
  flattenDiagnosticMessageText,
  getLineAndCharacterOfPosition,
  getPreEmitDiagnostics
} from "typescript";
import { ModuleResolverPlugin } from "../../../lib/babel/plugins/module-resolver";
import { getParsedTypeScriptConfig } from "../../../lib/typescript/tsconfig";
import { getFileHeader } from "../../../lib/utilities/file-header";
import { getSourceFile, getString } from "../../../lib/utilities/source-file";
import { EngineHooks } from "../../../types/build";
import { Context } from "../../../types/context";

/**
 * Prepares the TypeScript definitions for the Storm Stack project.
 *
 * @remarks
 * This function calls the `prepare:types` hook and generates type declarations for the runtime artifacts if enabled.
 *
 * @param context - The context containing options and environment paths.
 * @param hooks - The engine hooks to call during preparation.
 * @returns A promise that resolves when the preparation is complete.
 */
export async function prepareTypes(context: Context, hooks: EngineHooks) {
  context.log(
    LogLevelLabel.TRACE,
    `Preparing the TypeScript definitions for the Storm Stack project.`
  );

  await context.vfs.rm(context.runtimeDtsFilePath);

  context.log(LogLevelLabel.TRACE, "Transforming runtime files.");

  const runtimeFiles = await Promise.all(
    (await context.vfs.listRuntimeFiles())
      .filter(file => !context.vfs.isMatchingRuntimeId("index", file.id))
      .map(async file => {
        file.contents = await context.compiler.transform(
          context,
          file.path,
          file.contents,
          {
            skipTransformUnimport: true,
            babel: {
              plugins: [ModuleResolverPlugin, ...context.options.babel.plugins]
            }
          }
        );

        context.log(
          LogLevelLabel.TRACE,
          `Writing transformed runtime file ${file.id}.`
        );

        await context.vfs.writeRuntimeFile(file.id, file.path, file.contents);

        return file.path;
      })
  );

  const typescriptPath = await resolvePackage("typescript");
  if (!typescriptPath) {
    throw new Error(
      "Could not resolve TypeScript package location. Please ensure TypeScript is installed."
    );
  }

  const files = runtimeFiles.reduce<string[]>(
    (ret, fileName) => {
      const formatted = replacePath(fileName, context.options.workspaceRoot);
      if (!ret.includes(formatted)) {
        ret.push(formatted);
      }

      return ret;
    },
    [joinPaths(typescriptPath, "lib", "lib.esnext.full.d.ts")] // await listFiles(joinPaths(typescriptPath, "lib", "lib.*.d.ts"))
  );

  context.log(
    LogLevelLabel.TRACE,
    "Parsing TypeScript configuration for the Storm Stack project."
  );

  const sourceFileDts = getSourceFile(
    context.runtimeDtsFilePath,
    `${getFileHeader(null, false)}

`
  );

  await hooks
    .callHook("prepare:types", context, sourceFileDts)
    .catch((error: Error) => {
      context.log(
        LogLevelLabel.ERROR,
        `An error occurred while preparing the TypeScript definitions for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
      );

      throw new Error(
        "An error occurred while preparing the TypeScript definitions for the Storm Stack project",
        { cause: error }
      );
    });

  await context.vfs.writeFileToDisk(
    sourceFileDts.id,
    getString(sourceFileDts.code)
  );

  const resolvedTsconfig = getParsedTypeScriptConfig(
    context.options.workspaceRoot,
    context.options.projectRoot,
    context.tsconfig.tsconfigFilePath,
    defu(
      {
        compilerOptions: {
          strict: false,
          noEmit: false,
          declaration: true,
          declarationMap: false,
          emitDeclarationOnly: true,
          skipLibCheck: true
        },
        exclude: ["node_modules", "dist"],
        include: files
      },
      context.options.tsconfigRaw ?? {}
    ) as TsConfigJson
  );
  resolvedTsconfig.options.configFilePath = joinPaths(
    context.options.workspaceRoot,
    context.tsconfig.tsconfigFilePath
  );
  resolvedTsconfig.options.pathsBasePath = context.options.workspaceRoot;
  resolvedTsconfig.options.suppressOutputPathCheck = true;

  context.log(LogLevelLabel.TRACE, "Creating the TypeScript compiler host");

  const program = createProgram(
    files,
    resolvedTsconfig.options,
    createCompilerHost(resolvedTsconfig.options)
  );

  context.log(
    LogLevelLabel.TRACE,
    `Running TypeScript compiler on ${runtimeFiles.length} runtime files.`
  );

  // const transformer = createImportTransformer(context);

  let runtimeModules = "";
  const emitResult = program.emit(
    undefined,
    (fileName, text, _, __, sourceFiles, _data) => {
      const sourceFile = sourceFiles?.[0];
      if (sourceFile?.fileName && !fileName.endsWith(".map")) {
        if (context.vfs.isRuntimeFile(sourceFile.fileName)) {
          runtimeModules += `
declare module "${context.vfs.resolveId(sourceFile.fileName)}" {
    ${text
      .trim()
      .replace(/^\s*export\s*declare\s*/gm, "export ")
      .replace(/^\s*declare\s*/gm, "")}
}
`;
        }
      }
    },
    undefined,
    true
  );

  const diagnostics = getPreEmitDiagnostics(program).concat(
    emitResult.diagnostics
  );
  const diagnosticMessages: string[] = [];

  diagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!
      );
      const message = flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      diagnosticMessages.push(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      const message = flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      diagnosticMessages.push(message);
    }
  });

  const diagnosticMessage = diagnosticMessages.join("\n");
  if (diagnosticMessage) {
    throw new Error(
      `TypeScript compilation failed: \n\n${
        diagnosticMessage.length > 5000
          ? `${diagnosticMessage.slice(0, 5000)}...`
          : diagnosticMessage
      }`
    );
  }

  const corePackagePath = await resolvePackage("@storm-stack/core");
  if (!corePackagePath || !existsSync(corePackagePath)) {
    throw new Error(
      `Could not resolve @storm-stack/core package location: ${corePackagePath} does not exist.`
    );
  }

  const mainEntryPointFilePath = joinPaths(
    corePackagePath,
    "dist",
    "runtime-types",
    "esm",
    "index.d.ts"
  );
  if (!existsSync(mainEntryPointFilePath)) {
    throw new Error(
      `Could not resolve @storm-stack/core/runtime-types package location: ${mainEntryPointFilePath} does not exist.`
    );
  }

  context.log(
    LogLevelLabel.TRACE,
    `Running API Extractor on @storm-stack/core/runtime-types package at ${mainEntryPointFilePath}.`
  );

  const untrimmedFilePath = joinPaths(
    context.dtsPath,
    `${context.meta.projectRootHash}.d.ts`
  );

  const extractorResult: ExtractorResult = Extractor.invoke(
    ExtractorConfig.prepare({
      configObject: {
        mainEntryPointFilePath,
        apiReport: {
          enabled: false,

          // `reportFileName` is not been used. It's just to fit the requirement of API Extractor.
          reportFileName: "report.api.md"
        },
        docModel: { enabled: false },
        dtsRollup: {
          enabled: true,
          untrimmedFilePath
        },
        tsdocMetadata: { enabled: false },
        compiler: {
          tsconfigFilePath: relativePath(
            joinPaths(
              context.options.workspaceRoot,
              context.options.projectRoot
            ),
            joinPaths(
              context.options.workspaceRoot,
              context.tsconfig.tsconfigFilePath
            )
          )
        },
        projectFolder: joinPaths(
          context.options.workspaceRoot,
          context.options.projectRoot
        ),
        newlineKind: "lf"
      },
      configObjectFullPath: undefined,
      packageJsonFullPath: joinPaths(
        context.options.workspaceRoot,
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
      } warnings when processing @storm-stack/core/runtime-types package.`
    );
  }

  context.log(
    LogLevelLabel.TRACE,
    `Generating TypeScript declaration file in ${context.runtimeDtsFilePath}.`
  );

  const sourceFile = getSourceFile(
    context.runtimeDtsFilePath,
    `${getFileHeader(null, false)}

${(await context.vfs.readFile(untrimmedFilePath))!
  .replace(/\s*export.*__Ω.*;/g, "")
  .replace(/^export\s*\{\s*\}\s*$/gm, "")
  .replace(/^export\s*(?:declare\s*)?interface\s*/gm, "interface ")
  .replace(/^export\s*(?:declare\s*)?type\s*/gm, "type ")
  .replace(/^export\s*(?:declare\s*)?const\s*/gm, "declare const ")
  .replace(
    /: Storage(?:_\d+)?;$/gm,
    ': import("unstorage").Storage<import("unstorage").StorageValue>;'
  )}

${runtimeModules}`
      .replace(
        // eslint-disable-next-line regexp/no-super-linear-backtracking
        /import\s*(?:type\s*)?\{?[\w,\s]*(?:\}\s*)?from\s*(?:'|")@?[a-zA-Z0-9-\\/.]*(?:'|");?/g,
        ""
      )
      .replaceAll("#private;", "")
      .replace(/__Ω/g, "")
  );

  await hooks
    .callHook("prepare:types", context, sourceFile)
    .catch((error: Error) => {
      context.log(
        LogLevelLabel.ERROR,
        `An error occurred while preparing the TypeScript definitions for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
      );

      throw new Error(
        "An error occurred while preparing the TypeScript definitions for the Storm Stack project",
        { cause: error }
      );
    });

  await context.vfs.writeFileToDisk(sourceFile.id, getString(sourceFile.code));

  // context.vfs[__VFS_REVERT__]();
}
