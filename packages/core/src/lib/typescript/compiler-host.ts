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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { joinPaths } from "@stryke/path/join-paths";
import { replacePath } from "@stryke/path/replace";
import { resolvePackage } from "@stryke/path/resolve";
import { isFunction } from "@stryke/type-checks/is-function";
import { TsConfigJson } from "@stryke/types/tsconfig";
import defu from "defu";
import {
  CompilerHost,
  CompilerOptions,
  createCompilerHost as createCompilerHostWorker,
  createProgram as createProgramWorker,
  createSourceFile,
  CreateSourceFileOptions,
  Program,
  ScriptTarget,
  SourceFile,
  sys,
  System,
  WriteFileCallbackData
} from "typescript";
import { Context } from "../../types/context";
import { getDefaultCompilerOptions } from "./program";
import { getParsedTypeScriptConfig } from "./tsconfig";

export type ModuleImportResult =
  | { module: unknown; error: undefined }
  | { module: undefined; error: { stack?: string; message?: string } };

export interface TypeScriptSystem extends System {
  require: (baseDir: string, moduleName: string) => ModuleImportResult;
}

// function getDefaultCompilerOptions(): CompilerOptions {
//   return {
//     ...tsGetDefaultCompilerOptions(),
//     jsx: JsxEmit.React,
//     strict: true,
//     esModuleInterop: true,
//     module: ModuleKind.ESNext,
//     suppressOutputPathCheck: true,
//     skipLibCheck: true,
//     skipDefaultLibCheck: true,
//     moduleResolution: ModuleResolutionKind.Node10
//   };
// }

/**
 * Creates a TypeScript compiler host that uses the virtual file system (VFS) from the provided context to resolve paths.
 *
 * @param context - The context containing the virtual file system.
 * @param compilerOptions - The TypeScript compiler options.
 * @returns A TypeScript compiler host with VFS path resolution.
 */
export function createCompilerHost(
  context: Context,
  compilerOptions: CompilerOptions
): CompilerHost {
  const host = createCompilerHostWorker(compilerOptions);

  return {
    ...host,
    require(baseDir: string, moduleName: string) {
      const modulePath = context.vfs.resolvePath(moduleName);
      if (modulePath) {
        return {
          module: context.vfs.readFileSync(modulePath),
          modulePath,
          error: undefined
        };
      }

      if (isFunction((sys as TypeScriptSystem)?.require)) {
        return (sys as TypeScriptSystem).require(baseDir, moduleName);
      }

      return {
        module: {},
        error: new Error(
          `Failed to resolve module '${moduleName}' from '${
            baseDir
          }' during TypeScript compilation. This is likely due to a missing dependency or an incorrect module path.`
        )
      };
    },
    getCanonicalFileName(fileName: string): string {
      return (
        context.vfs.resolvePath(fileName) || host.getCanonicalFileName(fileName)
      );
    },
    realpath(fileName: string) {
      return context.vfs.resolvePath(fileName) || host.realpath?.(fileName);
    },
    fileExists(fileName: string): boolean {
      if (context.vfs.existsSync(fileName)) {
        return true;
      }

      if (fileName.includes("tsconfig.json")) {
        return false;
      }

      return host.fileExists(fileName);
    },
    readFile(fileName: string): string | undefined {
      if (context.vfs.existsSync(fileName)) {
        return context.vfs.readFileSync(fileName);
      }

      return host.readFile(fileName);
    },
    writeFile(
      fileName: string,
      text: string,
      writeByteOrderMark: boolean,
      onError?: ((message: string) => void) | undefined,
      sourceFiles?: readonly SourceFile[] | undefined,
      data?: WriteFileCallbackData
    ): void {
      context.vfs.existsSync(fileName)
        ? context.vfs.writeFileSync(fileName, text)
        : host.writeFile(
            fileName,
            text,
            writeByteOrderMark,
            onError,
            sourceFiles,
            data
          );
    },
    getSourceFile(
      fileName: string,
      languageVersionOrOptions: ScriptTarget | CreateSourceFileOptions,
      onError?: (message: string) => void,
      shouldCreateNewSourceFile?: boolean
    ): SourceFile | undefined {
      const path = context.vfs.resolvePath(fileName);
      if (path) {
        try {
          return createSourceFile(
            path,
            context.vfs.readFileSync(path)!,
            languageVersionOrOptions ??
              compilerOptions.target ??
              getDefaultCompilerOptions().target!,
            false
          );
        } catch (error: unknown) {
          context.log(
            LogLevelLabel.ERROR,
            `Failed to create source file for '${fileName}': ${
              (error as Error).message
            }`
          );
          throw error;
        }
      }

      return host.getSourceFile(
        fileName,
        languageVersionOrOptions,
        onError,
        shouldCreateNewSourceFile
      );
    }
  } as CompilerHost;
}

export async function createProgram(
  context: Context,
  fileNames: string[],
  _options: Partial<CompilerOptions> = {}
): Promise<Program> {
  context.log(LogLevelLabel.TRACE, "Adding TypeScript library files.");

  const typescriptPath = await resolvePackage("typescript");
  if (!typescriptPath) {
    throw new Error(
      "Could not resolve TypeScript package location. Please ensure TypeScript is installed."
    );
  }

  const files = fileNames.reduce<string[]>(
    (ret, fileName) => {
      const formatted = replacePath(fileName, context.options.workspaceRoot);
      if (!ret.includes(formatted)) {
        ret.push(formatted);
      }

      return ret;
    },
    [joinPaths(typescriptPath, "lib", "lib.esnext.full.d.ts")]
  );

  context.log(
    LogLevelLabel.TRACE,
    "Parsing TypeScript configuration for the Storm Stack project."
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
        include: fileNames
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

  // const host = createCompilerHostWorker(resolvedTsconfig.options);
  const host = createCompilerHost(context, resolvedTsconfig.options);

  context.log(LogLevelLabel.TRACE, "Creating the TypeScript compiler program");

  return createProgramWorker(files, resolvedTsconfig.options, host);
}
