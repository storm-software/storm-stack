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

import { listFiles } from "@stryke/fs/list-files";
import { readFile } from "@stryke/fs/read-file";
import { findFileName } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { resolvePackage } from "@stryke/path/resolve";
import defu from "defu";
import { minimatch } from "minimatch";
import ts, { CompilerOptions } from "typescript";
import { Context } from "../../types/context";

export const SourcesMap = Map<string, string>;
// eslint-disable-next-line ts/no-redeclare
export type SourcesMap = InstanceType<typeof SourcesMap>;

export async function loadLibFiles(): Promise<SourcesMap> {
  const libLocation = await resolvePackage("typescript");
  if (!libLocation) {
    throw new Error("Could not resolve TypeScript package location.");
  }

  const libFiles = await listFiles(
    joinPaths(libLocation, "lib", "**", "lib.*.d.ts")
  );
  if (libFiles.length === 0) {
    throw new Error("No TypeScript library files found.");
  }

  const lib: SourcesMap = new Map();
  for (const file of libFiles) {
    lib.set(
      `/node_modules/typescript/lib/${findFileName(file)}`,
      await readFile(file)
    );
  }

  return lib;
}

/** The default compiler options if TypeScript could ever change the compiler options */
export function getDefaultCompilerOptions(): CompilerOptions {
  return {
    ...ts.getDefaultCompilerOptions(),
    jsx: ts.JsxEmit.React,
    strict: true,
    esModuleInterop: true,
    module: ts.ModuleKind.ESNext,
    suppressOutputPathCheck: true,
    skipLibCheck: true,
    skipDefaultLibCheck: true,
    moduleResolution: ts.ModuleResolutionKind.Node10
  };
}

/**
 * Creates a TypeScript program from in-memory, virtual source files.
 *
 * @param rootNames - An array of root file names to include in the program.
 * @param context - The context containing options and environment paths.
 * @param compilerOptions - Optional TypeScript compiler options. Defaults to the standard TypeScript options
 * @returns A TypeScript program instance that can be used for type checking, emitting, etc.
 * @throws If the provided library files are not in the expected format or if the TypeScript package cannot be resolved.
 */
export async function createVirtualProgram(
  rootNames: readonly string[],
  context: Context,
  compilerOptions: ts.CompilerOptions = {}
): Promise<ts.Program> {
  const options = defu(compilerOptions, getDefaultCompilerOptions());

  const host = {
    name: "storm-vfs",
    root: context.options.workspaceRoot,
    ...ts.sys,
    realpath: (path: string) => {
      if (context.vfs.existsSync(path)) {
        return context.vfs.resolvePath(path);
      }

      return ts.sys.realpath?.(path) ?? path;
    },
    getCurrentDirectory(): string {
      return context.options.workspaceRoot;
    },
    getCanonicalFileName(fileName: string): string {
      return fileName;
    },
    getDefaultLibFileName(_options: ts.CompilerOptions): string {
      return ts.getDefaultLibFileName(options);
    },
    getDefaultLibLocation(): string {
      return "/";
    },
    getNewLine(): string {
      return "\n";
    },
    useCaseSensitiveFileNames(): boolean {
      return true;
    },
    fileExists(fileName: string): boolean {
      return context.vfs.existsSync(fileName);
    },
    readFile(fileName: string): string | undefined {
      if (context.vfs.existsSync(fileName)) {
        return context.vfs.readFileSync(fileName);
      }

      return undefined;
    },
    readDirectory: (
      path: string,
      extensions: readonly string[] = [],
      exclude: readonly string[] = [],
      include: readonly string[] = []
    ) => {
      let results = [] as string[];
      if (context.vfs.existsSync(path)) {
        results = context.vfs.readdirSync(path, {
          encoding: "utf8",
          recursive: true
        });

        if (extensions.length > 0) {
          results = results.filter(file =>
            extensions.some(ext =>
              file.endsWith(ext.startsWith(".") ? ext : `.${ext}`)
            )
          );
        }

        if (exclude.length > 0) {
          results = results.filter(
            file => !exclude.some(pattern => minimatch(file, pattern))
          );
        }

        if (include.length > 0) {
          results = results.filter(file =>
            include.some(pattern => minimatch(file, pattern))
          );
        }
      }

      return results;
    },
    writeFile(fileName: string, data: string): void {
      context.vfs.writeFileSync(fileName, data);
    },
    resolvePath: fileName => {
      if (context.vfs.existsSync(fileName)) {
        return context.vfs.resolvePath(fileName);
      }

      return ts.sys.resolvePath(fileName);
    },
    getSourceFile(
      fileName: string,
      languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
      _?: (message: string) => void,
      shouldCreateNewSourceFile?: boolean
    ): ts.SourceFile | undefined {
      if (context.vfs.existsSync(fileName)) {
        return ts.createSourceFile(
          fileName,
          context.vfs.readFileSync(fileName)!,
          languageVersionOrOptions ??
            compilerOptions.target ??
            getDefaultCompilerOptions().target!,
          false
        );
      } else if (shouldCreateNewSourceFile) {
        const sourceFile = ts.createSourceFile(
          fileName,
          "",
          languageVersionOrOptions ??
            compilerOptions.target ??
            getDefaultCompilerOptions().target!,
          false
        );
        context.vfs.writeFileSync(fileName, sourceFile.text);
        return sourceFile;
      }

      return undefined;
    }
  } as ts.CompilerHost;

  // const host = {
  //   ...ts.sys,
  //   getCanonicalFileName: fileName => fileName,
  //   getDefaultLibFileName: () =>
  //     `/${ts.getDefaultLibFileName(compilerOptions)}`,
  //   // getDefaultLibLocation: () => '/',
  //   getNewLine: () => ts.sys.newLine,
  //   getSourceFile: (fileName, languageVersionOrOptions) => {
  //     if (context.vfs.existsSync(fileName)) {
  //       return ts.createSourceFile(
  //         fileName,
  //         context.vfs.readFileSync(fileName)!,
  //         languageVersionOrOptions ??
  //           compilerOptions.target ??
  //           getDefaultCompilerOptions().target!,
  //         false
  //       );
  //     }

  //     const sourceFile = ts.createSourceFile(
  //       fileName,
  //       ts.sys.readFile(fileName)!,
  //       languageVersionOrOptions ??
  //         compilerOptions.target ??
  //         getDefaultCompilerOptions().target!,
  //       false
  //     );
  //     context.vfs.writeFileSync(fileName, sourceFile.text);

  //     return sourceFile;
  //   },
  //   useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames
  // };

  return ts.createProgram(rootNames, options, host);
}

/**
 * Creates a file-system backed System object which can be used in a TypeScript program, you provide
 * a set of virtual files which are prioritized over the FS versions, then a path to the root of your
 * project (basically the folder your node_modules lives)
 */
// export async function createVirtualSystem(
//   context: Context
// ): Promise<ts.System> {
//   const projectRoot = joinPaths(
//     context.options.workspaceRoot,
//     context.options.projectRoot
//   );

//   // We need to make an isolated folder for the tsconfig, but also need to be able to resolve the
//   // existing node_modules structures going back through the history
//   const root = joinPaths(projectRoot, "vfs");

//   // The default System in TypeScript
//   const tsLib = await resolvePackage("typescript", {
//     paths: [context.options.workspaceRoot, projectRoot, root]
//   });
//   if (!tsLib) {
//     throw new Error("Could not resolve TypeScript package location.");
//   }

//   return {
//     // @ts-ignore
//     name: "storm-vfs",
//     root,
//     args: [],
//     createDirectory: () => {
//       throw new Error("createDirectory not implemented");
//     },
//     directoryExists: (path: string) => {
//       return (
//         context.vfs.values().some(file => file.path.startsWith(path)) ||
//         ts.sys.directoryExists(path)
//       );
//     },
//     exit: () => ts.sys.exit(),
//     fileExists: (path: string) => {
//       if (context.vfs.has(path)) {
//         return true;
//       }

//       // Don't let other tsconfigs end up touching the vfs
//       if (path.includes("tsconfig.json")) {
//         return false;
//       }

//       if (path.startsWith("/lib")) {
//         const tsLibName = `${tsLib}/${path.replace("/", "")}`;

//         return ts.sys.fileExists(tsLibName);
//       }

//       return ts.sys.fileExists(path);
//     },
//     getCurrentDirectory: () => root,
//     getDirectories: (path: string) => ts.sys.getDirectories(path),
//     getExecutingFilePath: () => {
//       throw new Error("getExecutingFilePath not implemented.");
//     },
//     readDirectory: (
//       path: string,
//       extensions?: readonly string[],
//       exclude?: readonly string[],
//       include?: readonly string[],
//       depth?: number
//     ) => {
//       return ts.sys
//         .readDirectory(path, extensions, exclude, include, depth)
//         .reduce((ret, file) => {
//           if (!ret.includes(file)) {
//             ret.push(file);
//           }
//           return ret;
//         }, context.vfs.readDirectory(path));
//     },
//     readFile: (path: string) => {
//       const virtualFile = context.vfs.readFile(path);
//       if (virtualFile) {
//         return virtualFile.contents?.toString();
//       }

//       if (path.startsWith("/lib")) {
//         const tsLibName = `${tsLib}/${path.replace("/", "")}`;
//         const result = ts.sys.readFile(tsLibName);
//         if (!result) {
//           const libs = ts.sys.readDirectory(tsLib);
//           throw new Error(
//             `A request was made for ${tsLibName} but there wasn't a file found in the file map. You likely have a mismatch in the compiler options for the CDN download vs the compiler program. Existing Libs: ${libs.join(", ")}.`
//           );
//         }

//         return result;
//       }

//       return ts.sys.readFile(path);
//     },
//     resolvePath: (path: string) => {
//       if (context.vfs.has(path)) {
//         return path;
//       }

//       return ts.sys.resolvePath(path);
//     },
//     newLine: "\n",
//     useCaseSensitiveFileNames: true,
//     write: () => {
//       throw new Error("write not implemented");
//     },
//     writeFile: (fileName, contents) => {
//       void context.vfs.writeFile(fileName, contents);
//     },
//     deleteFile: fileName => {
//       context.vfs.deleteFile(fileName);
//     },
//     realpath: (path: string) => String(ts.sys.realpath?.(path))
//   };
// }

interface VirtualCompilerHostReturn {
  compilerHost: ts.CompilerHost;
  updateFile: (sourceFile: ts.SourceFile) => boolean;
  deleteFile: (sourceFile: ts.SourceFile) => boolean;
}

/**
 * Creates an in-memory CompilerHost -which is essentially an extra wrapper to System
 * which works with TypeScript objects - returns both a compiler host, and a way to add new SourceFile
 * instances to the in-memory file system.
 */
export function createVirtualCompilerHost(
  sys: ts.System,
  compilerOptions: ts.CompilerOptions
) {
  const sourceFiles = new Map<string, ts.SourceFile>();
  const save = (sourceFile: ts.SourceFile) => {
    sourceFiles.set(sourceFile.fileName, sourceFile);
    return sourceFile;
  };

  const vHost: VirtualCompilerHostReturn = {
    compilerHost: {
      ...sys,
      getCanonicalFileName: fileName => fileName,
      getDefaultLibFileName: () =>
        `/${ts.getDefaultLibFileName(compilerOptions)}`, // '/lib.d.ts',
      // getDefaultLibLocation: () => '/',
      getNewLine: () => sys.newLine,
      getSourceFile: (fileName, languageVersionOrOptions) => {
        return (
          sourceFiles.get(fileName) ??
          save(
            ts.createSourceFile(
              fileName,
              sys.readFile(fileName)!,
              languageVersionOrOptions ?? compilerOptions.target,
              false
            )
          )
        );
      },
      useCaseSensitiveFileNames: () => sys.useCaseSensitiveFileNames
    },
    updateFile: sourceFile => {
      const alreadyExists = sourceFiles.has(sourceFile.fileName);
      sys.writeFile(sourceFile.fileName, sourceFile.text);
      sourceFiles.set(sourceFile.fileName, sourceFile);
      return alreadyExists;
    },
    deleteFile: sourceFile => {
      const alreadyExists = sourceFiles.has(sourceFile.fileName);
      sourceFiles.delete(sourceFile.fileName);
      sys.deleteFile!(sourceFile.fileName);
      return alreadyExists;
    }
  };

  return vHost;
}
