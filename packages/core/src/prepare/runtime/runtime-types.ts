/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import type {
  ExtractorResult,
  IConfigFile,
  IExtractorConfigPrepareOptions
} from "@microsoft/api-extractor";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { removeDirectory } from "@stryke/fs/helpers";
import { listFiles } from "@stryke/fs/list-files";
import { writeFile } from "@stryke/fs/write-file";
import {
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { resolvePackage } from "@stryke/path/resolve";
import { slash } from "@stryke/path/slash";
import { TsConfigJson } from "@stryke/types/tsconfig";
import defu from "defu";
import ts from "typescript";
import { getParsedTypeScriptConfig } from "../../helpers/typescript/tsconfig";
import { getFileHeader } from "../../helpers/utilities/file-header";
import { Context, Options } from "../../types/build";
import { LogFn } from "../../types/config";

/**
 * Options for the API Extractor.
 */
export type ApiExtractorOptions<TOptions extends Options = Options> = Pick<
  TOptions,
  "projectRoot" | "platform" | "tsconfig" | "tsconfigRaw"
> &
  Pick<Context<TOptions>, "envPaths"> & {
    runtimePath: string;
    workspaceRoot: string;
    dts: string;
  };

function rollupDtsFile(
  workspaceRoot: string,
  projectRoot: string,
  inputFilePath: string,
  outputFilePath: string,
  tsconfigFilePath?: string
) {
  const packageJsonFullPath = joinPaths(
    workspaceRoot,
    projectRoot,
    "package.json"
  );
  const configObject: IConfigFile = {
    mainEntryPointFilePath: inputFilePath,
    apiReport: {
      enabled: false,

      // `reportFileName` is not been used. It's just to fit the requirement of API Extractor.
      reportFileName: "report.api.md"
    },
    docModel: { enabled: false },
    dtsRollup: {
      enabled: true,
      untrimmedFilePath: outputFilePath
    },
    tsdocMetadata: { enabled: false },
    compiler: {
      tsconfigFilePath: joinPaths(
        workspaceRoot,
        tsconfigFilePath || "tsconfig.json"
      )
    },
    projectFolder: joinPaths(workspaceRoot, projectRoot),
    newlineKind: "lf"
  };
  const prepareOptions: IExtractorConfigPrepareOptions = {
    configObject,
    configObjectFullPath: undefined,
    packageJsonFullPath
  };

  const extractorConfig = ExtractorConfig.prepare(prepareOptions);

  // Invoke API Extractor
  const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
    // Equivalent to the "--local" command-line parameter
    localBuild: true,

    // Equivalent to the "--verbose" command-line parameter
    showVerboseMessages: true
  });

  if (!extractorResult.succeeded) {
    throw new Error(
      `API Extractor completed with ${extractorResult.errorCount} errors and ${extractorResult.warningCount} warnings when processing ${inputFilePath}`
    );
  }
}

/**
 * Represents an export declaration in the API Extractor context.
 */
export type ExportDeclaration = ModuleExport | NamedExport;

interface ModuleExport {
  kind: "module";
  sourceFileName: string;
  destFileName: string;
  moduleName: string;
  isTypeOnly: boolean;
}

interface NamedExport {
  kind: "named";
  sourceFileName: string;
  destFileName: string;
  alias: string;
  name: string;
  isTypeOnly: boolean;
}

function formatAggregationExport(
  declaration: ExportDeclaration,
  declarationDirPath: string
): string {
  const dest = `./${slash(
    relativePath(declarationDirPath, declaration.destFileName)
  )}`.replace(/\.d\.(ts|mts|cts)$/, (_, fileExtension: string) => {
    switch (fileExtension) {
      case "ts":
        return ".js";
      case "mts":
        return ".mjs";
      case "cts":
        return ".cjs";
      default:
        return "";
    }
  });

  if (declaration.kind === "module") {
    // Not implemented
    return "";
  } else if (declaration.kind === "named") {
    return [
      "export",
      declaration.isTypeOnly ? "type" : "",
      "{",
      declaration.name,
      declaration.name === declaration.alias ? "" : `as ${declaration.alias}`,
      "} from",
      `'${dest}';`
    ]
      .filter(Boolean)
      .join(" ");
  } else {
    throw new Error("Unknown declaration");
  }
}

function formatAggregationExports(
  exports: ExportDeclaration[],
  declarationDirPath: string
): string {
  const lines = exports
    .map(declaration =>
      formatAggregationExport(declaration, declarationDirPath)
    )
    .filter(Boolean);

  if (lines.length === 0) {
    lines.push("export {};");
  }

  return `${lines.join("\n")}\n`;
}

function formatDistributionExport(
  declaration: ExportDeclaration,
  dest: string
): string {
  if (declaration.kind === "named") {
    return [
      "export",
      declaration.isTypeOnly ? "type" : "",
      "{",
      declaration.alias,
      declaration.name === declaration.alias ? "" : `as ${declaration.name}`,
      "} from",
      `'${dest}';`
    ]
      .filter(Boolean)
      .join(" ");
  } else if (declaration.kind === "module") {
    return `export * from '${declaration.moduleName}';`;
  }
  return "";
}

export function formatDistributionExports(
  exports: ExportDeclaration[],
  fromFilePath: string,
  toFilePath: string
) {
  let importPath = relativePath(
    findFilePath(slash(fromFilePath)),
    slash(toFilePath)
  ).replace(/\.d\.(ts|mts|cts)$/, (_, fileExtension: string) => {
    switch (fileExtension) {
      case "ts":
        return ".js";
      case "mts":
        return ".mjs";
      case "cts":
        return ".cjs";
      default:
        return "";
    }
  });

  if (!/^\.+\//.test(importPath)) {
    importPath = `./${importPath}`;
  }

  const seen = {
    named: new Set<string>(),
    module: new Set<string>()
  };

  const lines = exports
    .filter(declaration => {
      if (declaration.kind === "module") {
        if (seen.module.has(declaration.moduleName)) {
          return false;
        }
        seen.module.add(declaration.moduleName);
        return true;
      } else if (declaration.kind === "named") {
        if (seen.named.has(declaration.name)) {
          return false;
        }
        seen.named.add(declaration.name);
        return true;
      } else {
        return false;
      }
    })
    .map(declaration => formatDistributionExport(declaration, importPath))
    .filter(Boolean);

  if (lines.length === 0) {
    lines.push("export {};");
  }

  return `${lines.join("\n")}\n`;
}

async function rollupDtsFiles<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  exports: ExportDeclaration[],
  declarationDir: string
) {
  const dtsInputFilePath = joinPaths(
    declarationDir,
    "_storm-dts-aggregation.d.ts"
  );
  const dtsOutputFilePath = joinPaths(declarationDir, "_storm-dts-rollup.d.ts");

  await writeFile(
    dtsInputFilePath,
    formatAggregationExports(exports, declarationDir)
  );

  rollupDtsFile(
    context.workspaceConfig.workspaceRoot,
    context.options.projectRoot,
    dtsInputFilePath,
    dtsOutputFilePath,
    context.options.tsconfig
  );

  for (const sourceFileName of await listFiles(
    joinPaths(context.runtimePath, "**/*.ts")
  )) {
    const outFileName = joinPaths(
      context.options.dts as string,
      `${findFileName(sourceFileName, {
        withExtension: false
      })}.d.ts`
    );

    await writeFile(
      outFileName,
      formatDistributionExports(
        exports.filter(
          declaration =>
            joinPaths(
              context.workspaceConfig.workspaceRoot,
              declaration.sourceFileName
            ) === sourceFileName
        ),
        outFileName,
        dtsOutputFilePath
      )
    );
  }
}

async function cleanDtsFiles(declarationPath: string, outputFile: string) {
  await removeDirectory(declarationPath);
  await removeDirectory(outputFile);
}

class AliasPool {
  private seen = new Set<string>();

  assign(name: string): string {
    let suffix = 0;
    let alias = name === "default" ? "default_alias" : name;

    while (this.seen.has(alias)) {
      alias = `${name}_alias_${++suffix}`;
      if (suffix >= 1000) {
        throw new Error(
          "Alias generation exceeded limit. Possible infinite loop detected."
        );
      }
    }

    this.seen.add(alias);
    return alias;
  }
}

async function runTypeScriptCompiler<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  declarationDir: string
): Promise<ExportDeclaration[]> {
  let fileNames = await listFiles(joinPaths(context.runtimePath, "**/*.ts"));

  await writeFile(
    joinPaths(context.runtimePath, "index.ts"),
    `${getFileHeader()}

${fileNames
  .map(
    fileName =>
      `export * from './${relativePath(context.runtimePath, fileName).replace(
        /\.tsx?$/,
        ""
      )}';`
  )
  .join("\n")}
`
  );

  const typesFiles = await listFiles(
    joinPaths(context.artifactsPath, "types", "*.ts")
  );
  fileNames = typesFiles.reduce((ret, fileName) => {
    if (!ret.includes(fileName)) {
      ret.push(fileName);
    }

    return ret;
  }, fileNames);

  const tsPackage = await resolvePackage("typescript");
  if (!tsPackage) {
    throw new Error("Could not resolve TypeScript package location.");
  }

  const libFiles = await listFiles(
    joinPaths(tsPackage, "lib", "**", "lib.*.d.ts")
  );
  if (libFiles.length === 0) {
    throw new Error("No TypeScript library files found.");
  }

  fileNames = libFiles
    .reduce((ret, fileName) => {
      if (!ret.includes(fileName)) {
        ret.push(fileName);
      }

      return ret;
    }, fileNames)
    .map(fileName =>
      fileName
        .replace(context.workspaceConfig.workspaceRoot, "")
        .replace(/^\//, "")
    );
  const resolvedTsconfig = await getParsedTypeScriptConfig(
    context.options.projectRoot,
    context.options.tsconfig,
    defu(
      {
        compilerOptions: {
          strict: false,
          noEmit: false,
          emitDeclarationOnly: true,
          declaration: true,
          declarationMap: true,
          declarationDir: relativePath(
            joinPaths(
              context.workspaceConfig.workspaceRoot,
              context.options.projectRoot
            ),
            declarationDir
          )
        }
      },
      context.options.tsconfigRaw ?? {}
    ) as TsConfigJson
  );
  resolvedTsconfig.options.configFilePath = joinPaths(
    context.workspaceConfig.workspaceRoot,
    context.options.tsconfig || "tsconfig.json"
  );
  resolvedTsconfig.options.pathsBasePath =
    context.workspaceConfig.workspaceRoot;

  // if (resolvedTsconfig.options.paths?.["@storm-stack/types/*"]) {
  //   for (const path of resolvedTsconfig.options.paths["@storm-stack/types/*"]) {
  //     const declFiles = await listFiles(path);
  //     if (declFiles.length === 0) {
  //       continue;
  //     }

  //     fileNames = declFiles
  //       .filter(
  //         fileName => !fileName.endsWith(".d.ts") && !fileName.endsWith(".map")
  //       )
  //       .reduce((ret, fileName) => {
  //         if (!ret.includes(fileName)) {
  //           ret.push(fileName);
  //         }

  //         return ret;
  //       }, fileNames)
  //       .map(fileName =>
  //         fileName
  //           .replace(context.workspaceConfig.workspaceRoot, "")
  //           .replace(/^\//, "")
  //       );
  //   }
  // }

  const host: ts.CompilerHost = ts.createCompilerHost(resolvedTsconfig.options);
  const program: ts.Program = ts.createProgram(
    fileNames,
    resolvedTsconfig.options,
    host
  );

  const fileMapping = new Map<string, string>();
  const writeFileCallback: ts.WriteFileCallback = (
    fileName,
    text,
    writeByteOrderMark,
    onError,
    sourceFiles,
    _data
  ) => {
    const sourceFile = sourceFiles?.[0];
    const sourceFileName = sourceFile?.fileName;

    if (sourceFileName && !fileName.endsWith(".map")) {
      fileMapping.set(
        joinPaths(context.workspaceConfig.workspaceRoot, sourceFileName),
        joinPaths(context.workspaceConfig.workspaceRoot, fileName)
      );
    }

    return host.writeFile(fileName, text, writeByteOrderMark);
  };

  const emitResult = program.emit(
    undefined,
    writeFileCallback,
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

  const checker = program.getTypeChecker();
  const aliasPool = new AliasPool();
  const assignAlias = aliasPool.assign.bind(aliasPool) as (
    name: string
  ) => string;

  function extractExports(sourceFileName: string): ExportDeclaration[] {
    sourceFileName = joinPaths(
      context.workspaceConfig.workspaceRoot,
      sourceFileName
    );

    const sourceFile = program.getSourceFile(sourceFileName);
    if (!sourceFile) {
      return [];
    }

    const destFileName = fileMapping.get(sourceFileName);
    if (!destFileName) {
      return [];
    }

    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) {
      return [];
    }

    const exports: ExportDeclaration[] = [];

    const exportSymbols = checker.getExportsOfModule(moduleSymbol);
    for (const symbol of exportSymbols) {
      const name = symbol.getName();
      exports.push({
        kind: "named",
        sourceFileName,
        destFileName,
        name,
        alias: assignAlias(name),
        isTypeOnly: false
      });
    }

    return exports;
  }

  return program.getRootFileNames().flatMap(extractExports);
}

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
  const declarationPath = joinPaths(context.artifactsPath, "dts");

  await cleanDtsFiles(declarationPath, context.options.dts as string);

  const exports = await runTypeScriptCompiler(log, context, declarationPath);
  if (exports.length === 0) {
    log(
      LogLevelLabel.WARN,
      "No exports found. API Extractor will not generate any declaration files."
    );
    return;
  }

  // log(LogLevelLabel.SUCCESS, StormJSON.stringify(exports));

  // throw new Error(
  //   "API Extractor does not support TypeScript 5.8+ yet, so we cannot generate the declaration files."
  // );

  await rollupDtsFiles(log, context, exports, declarationPath);
}
