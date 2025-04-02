/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import { declarationTransformer, transformer } from "@deepkit/type-compiler";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { MaybePromise } from "@stryke/types/base";
import MagicString from "magic-string";
import { Project, ts } from "ts-morph";
import { getCache, setCache } from "./helpers/transform";
import { createLog } from "./helpers/utilities/logger";
import { getMagicString } from "./helpers/utilities/magic-string";
import { generateSourceMap } from "./helpers/utilities/source-map";
import type { LogFn } from "./types";
import type { CompilerResult, Options, SourceFile } from "./types/build";

export class Compiler {
  #cache: WeakMap<SourceFile, string> = new WeakMap();

  /**
   * The `ts-morph` project instance
   */
  public project: Project;

  /**
   * The logger function to use
   */
  protected log: LogFn;

  /**
   * The options provided to Storm Stack
   */
  protected options: Options;

  /**
   * The directory to store cache for the files in the project
   */
  protected cacheDir: string;

  /**
   * The root directory of the project
   */
  protected projectRoot: string;

  /**
   * The parsed TypeScript configuration
   */
  protected tsconfig: ts.ParsedCommandLine;

  /**
   * A callback function to be called before the source file is compiled
   */
  protected onTransformCallback: (
    sourceFile: SourceFile,
    project: Project
  ) => MaybePromise<SourceFile> = sourceFile => sourceFile;

  constructor(
    options: Options,
    cacheDir: string,
    tsconfig: ts.ParsedCommandLine,
    onTransformCallback?: (sourceFile: SourceFile) => MaybePromise<SourceFile>
  ) {
    this.options = options;
    this.log = createLog("compiler", this.options);

    this.cacheDir = cacheDir;
    this.projectRoot = this.options.projectRoot;
    this.tsconfig = tsconfig;

    if (onTransformCallback) {
      this.onTransformCallback = onTransformCallback;
    }

    this.project = new Project({
      compilerOptions: this.tsconfig.options,
      tsConfigFilePath: this.options.tsconfig
    });
  }

  /**
   * Compile the source code.
   *
   * @param options - The compiler options.
   * @param id - The name of the file to compile.
   * @param code - The source code to compile.
   * @returns The compiled source code and source map.
   */
  public async compile(
    id: string,
    code: string | MagicString
  ): Promise<string> {
    this.log(LogLevelLabel.TRACE, `Compiling ${id}`);

    const source = await Promise.resolve(
      this.onTransformCallback(this.getSourceFile(id, code), this.project)
    );

    let transpiled: string | undefined;

    transpiled = await this.getCache(source);
    if (transpiled) {
      this.log(LogLevelLabel.TRACE, `Cache hit: ${source.id}`);
    } else {
      this.log(LogLevelLabel.TRACE, `Cache miss: ${source.id}`);
    }

    if (!transpiled) {
      transpiled = await this.transpileModule(source);

      await this.setCache(source, transpiled);
    }

    return transpiled;
  }

  /**
   * Get the source file.
   *
   * @param id - The name of the file.
   * @param code - The source code.
   * @returns The source file.
   */
  public getSourceFile(id: string, code: string | MagicString): SourceFile {
    return {
      id,
      code: getMagicString(code),
      env: {}
    };
  }

  /**
   * Get the result of the compiler.
   *
   * @param sourceFile - The source file.
   * @param transpiled - The transpiled source code.
   * @returns The result of the compiler.
   */
  public getResult(
    sourceFile: SourceFile,
    transpiled?: string
  ): CompilerResult {
    return generateSourceMap(sourceFile.id, sourceFile.code, transpiled);
  }

  protected async getCache(sourceFile: SourceFile) {
    let cache = this.#cache.get(sourceFile);
    if (cache) {
      return cache;
    }

    if (this.options.skipCache) {
      return;
    }

    cache = await getCache(sourceFile, this.cacheDir);
    if (cache) {
      this.#cache.set(sourceFile, cache);
    }

    return cache;
  }

  protected async setCache(sourceFile: SourceFile, transpiled?: string) {
    if (transpiled) {
      this.#cache.set(sourceFile, transpiled);
    } else {
      this.#cache.delete(sourceFile);
    }

    if (this.options.skipCache) {
      return;
    }

    return setCache(sourceFile, this.cacheDir, transpiled);
  }

  /**
   * Transpile the module.
   *
   * @param source - The compiler source file.
   * @returns The transpiled module.
   */
  protected async transpileModule(source: SourceFile): Promise<string> {
    const current = {
      ...source,
      code: new MagicString(source.code.toString())
    } as SourceFile;

    const transpiled = ts.transpileModule(current.code.toString(), {
      compilerOptions: {
        ...this.project.getCompilerOptions(),
        configFilePath: this.options.tsconfig
      },
      fileName: current.id,
      transformers: {
        before: [transformer],
        after: [declarationTransformer]
      }
    });

    const transformed = current.code
      .overwrite(0, current.code.length(), transpiled.outputText)
      .toString();
    if (transformed === null) {
      this.log(LogLevelLabel.ERROR, `Transform is null: ${current.id}`);

      throw new Error(`Transform is null: ${current.id}`);
    } else {
      this.log(LogLevelLabel.TRACE, `Transformed: ${current.id}`);
    }

    return transformed;
  }
}
