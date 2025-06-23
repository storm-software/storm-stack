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

import { listFiles } from "@stryke/fs/list-files";
import { readFile } from "@stryke/fs/read-file";
import { findFileName } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { resolvePackage } from "@stryke/path/resolve";
import assert from "node:assert";
import ts from "typescript";
import { Context, Options } from "../../types/build";

export const SourcesMap = Map<string, string>;
// eslint-disable-next-line ts/no-redeclare
export type SourcesMap = InstanceType<typeof SourcesMap>;

const defaultCompilerOpts = ts.getDefaultCompilerOptions();

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

/**
 * Creates a TypeScript program from in-memory, virtual source files.
 *
 * @param context - The build context containing virtual file system and options.
 * @param host - Optional custom compiler host. If not provided, a default host will be created.
 * @param compilerOptions - Compiler options to use for the program. Defaults to TypeScript's default compiler options.
 * @param lib - Optional additional library files to include in the program. These should be provided as a Map of file paths to their contents.
 * @returns A TypeScript program instance that can be used for type checking, emitting, etc.
 * @throws If the provided library files are not in the expected format or if the TypeScript package cannot be resolved.
 */
export function createVirtualProgram<TOptions extends Options = Options>(
  context: Context<TOptions>,
  host?: ts.CompilerHost,
  compilerOptions = defaultCompilerOpts,
  // Provide additional lib files to TypeScript. These should all be prefixed with
  // `/node_modules/typescript/lib` (e.g. `/node_modules/typescript/lib/lib.esnext.d.ts`)
  lib?: SourcesMap
): ts.Program {
  if (lib) {
    context.vfs.add(lib);
  }

  const sourceFiles = new Map<string, ts.SourceFile>();
  for (const [filePath, fileContent] of context.vfs.entries()) {
    const sourceFile = ts.createSourceFile(
      filePath,
      fileContent.contents?.toString() || "",
      ts.ScriptTarget.ESNext,
      false,
      ts.ScriptKind.TS
    );
    sourceFiles.set(filePath, sourceFile);
  }

  host ??= {
    getCurrentDirectory(): string {
      return "/";
    },
    getCanonicalFileName(fileName: string): string {
      return fileName;
    },
    getDefaultLibFileName(_options: ts.CompilerOptions): string {
      return "";
    },
    getDefaultLibLocation(): string {
      return "/node_modules/typescript/lib";
    },
    getNewLine(): string {
      return "\n";
    },
    useCaseSensitiveFileNames(): boolean {
      return true;
    },
    fileExists(fileName: string): boolean {
      return sourceFiles.has(fileName);
    },
    readFile(_path: string): string | undefined {
      assert.fail("readFile() not implemented");
    },
    writeFile(
      _path: string,
      _data: string,
      _writeByteOrderMark?: boolean
    ): void {
      assert.fail("writeFile() not implemented");
    },
    getSourceFile(
      fileName: string,
      _languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
      _onError?: (message: string) => void,
      _shouldCreateNewSourceFile?: boolean
    ): ts.SourceFile | undefined {
      return sourceFiles.get(fileName);
    }
  };

  return ts.createProgram(context.vfs.keys(), compilerOptions, host);
}

/**
 * Creates a file-system backed System object which can be used in a TypeScript program, you provide
 * a set of virtual files which are prioritized over the FS versions, then a path to the root of your
 * project (basically the folder your node_modules lives)
 */
export async function createFSBackedSystem(
  files: Map<string, string>,
  projectRoot: string,
  workspaceRoot: string
): Promise<ts.System> {
  // We need to make an isolated folder for the tsconfig, but also need to be able to resolve the
  // existing node_modules structures going back through the history
  const root = `${projectRoot}/vfs`;

  // const path = require(
  //   String.fromCharCode(112, 97, 116, 104)
  // ) as typeof import("path");

  // The default System in TypeScript
  const tsLib = await resolvePackage("typescript", {
    paths: [
      workspaceRoot,
      projectRoot.startsWith(workspaceRoot)
        ? projectRoot
        : joinPaths(workspaceRoot, projectRoot),
      root
    ]
  });
  if (!tsLib) {
    throw new Error("Could not resolve TypeScript package location.");
  }

  return {
    // @ts-ignore
    name: "storm-vfs",
    root,
    args: [],
    createDirectory: () => {
      throw new Error("createDirectory not implemented");
    },
    directoryExists: (path: string) => {
      return (
        Array.from(files.keys()).some(directory =>
          directory.startsWith(path)
        ) || ts.sys.directoryExists(path)
      );
    },
    exit: () => ts.sys.exit(),
    fileExists: (path: string) => {
      if (files.has(path)) {
        return true;
      }

      // Don't let other tsconfigs end up touching the vfs
      if (path.includes("tsconfig.json")) {
        return false;
      }

      if (path.startsWith("/lib")) {
        const tsLibName = `${tsLib}/${path.replace("/", "")}`;

        return ts.sys.fileExists(tsLibName);
      }

      return ts.sys.fileExists(path);
    },
    getCurrentDirectory: () => root,
    getDirectories: (path: string) => ts.sys.getDirectories(path),
    getExecutingFilePath: () => {
      throw new Error("getExecutingFilePath not implemented.");
    },
    readDirectory: (...args) => {
      if (args[0] === "/") {
        return Array.from(files.keys());
      } else {
        return ts.sys.readDirectory(...args);
      }
    },
    readFile: (path: string) => {
      if (files.has(path)) {
        return files.get(path);
      }

      if (path.startsWith("/lib")) {
        const tsLibName = `${tsLib}/${path.replace("/", "")}`;
        const result = ts.sys.readFile(tsLibName);
        if (!result) {
          const libs = ts.sys.readDirectory(tsLib);
          throw new Error(
            `A request was made for ${tsLibName} but there wasn't a file found in the file map. You likely have a mismatch in the compiler options for the CDN download vs the compiler program. Existing Libs: ${libs.join(", ")}.`
          );
        }

        return result;
      }

      return ts.sys.readFile(path);
    },
    resolvePath: (path: string) => {
      if (files.has(path)) {
        return path;
      }

      return ts.sys.resolvePath(path);
    },
    newLine: "\n",
    useCaseSensitiveFileNames: true,
    write: () => {
      throw new Error("write not implemented");
    },
    writeFile: (fileName, contents) => {
      files.set(fileName, contents);
    },
    deleteFile: fileName => {
      files.delete(fileName);
    },
    realpath: (path: string) => String(ts.sys.realpath?.(path))
  };
}

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
