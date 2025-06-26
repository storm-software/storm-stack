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

import { declarationTransformer, transformer } from "@deepkit/type-compiler";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { readFileIfExistingSync } from "@stryke/fs/read-file";
import { hash } from "@stryke/hash/hash";
import { joinPaths } from "@stryke/path/join-paths";
import { replacePath } from "@stryke/path/replace";
import { slash } from "@stryke/path/slash";
import type MagicString from "magic-string";
import ts from "typescript";
import { transformConfig } from "../helpers/transform/transform-config";
import { transformContext } from "../helpers/transform/transform-context";
import { transformErrors } from "../helpers/transform/transform-errors";
import { getCache, setCache } from "../helpers/utilities/cache";
import { extendLog } from "../helpers/utilities/logger";
import { getMagicString } from "../helpers/utilities/magic-string";
import { generateSourceMap } from "../helpers/utilities/source-map";
import type { LogFn } from "../types";
import type {
  CompileOptions,
  CompilerOptions,
  CompilerResult,
  Context,
  ICompiler,
  SourceFile,
  TranspileOptions
} from "../types/build";

export class Compiler implements ICompiler {
  #cache: WeakMap<SourceFile, string> = new WeakMap();

  #options: CompilerOptions;

  /**
   * The logger function to use
   */
  protected log: LogFn;

  /**
   * The cache directory
   */
  protected cacheDir: string;

  constructor(log: LogFn, context: Context, options: CompilerOptions = {}) {
    this.log = extendLog(log, "compiler");
    this.#options = options;

    this.cacheDir = joinPaths(
      context.envPaths.cache,
      hash(context.tsconfig.options)
    );
  }

  /**
   * Transform the module.
   *
   * @param context - The compiler context.
   * @param id - The name of the file to compile.
   * @param code - The source code to compile.
   * @param options - The transpile options.
   * @returns The transpiled module.
   */
  public async transform(
    context: Context,
    id: string,
    code: string | MagicString,
    options: TranspileOptions = {}
  ): Promise<string> {
    this.log(LogLevelLabel.TRACE, `Transforming ${id}`);

    let source = this.getSourceFile(id, code);
    if (options.onPreTransform) {
      source = await Promise.resolve(options.onPreTransform(context, source));
    }

    if (this.#options.onPreTransform) {
      source = await Promise.resolve(
        this.#options.onPreTransform(context, source)
      );
    }

    if (!options.skipTransform) {
      if (context.options.platform === "node") {
        source = transformContext(source);
      }

      if (!options.skipDotenvTransform) {
        source = await transformConfig(this.log, source, context);
      }

      if (!options.skipErrorsTransform) {
        source = await transformErrors(this.log, source, context);
      }

      if (
        !options.skipUnimportTransform &&
        context.unimport &&
        !slash(source.id).includes(
          replacePath(
            context.runtimePath,
            joinPaths(
              context.workspaceConfig.workspaceRoot,
              context.options.projectRoot
            )
          )
        )
      ) {
        source = await context.unimport.injectImports(source);
      }

      if (this.#options.onTransform) {
        source = await Promise.resolve(
          this.#options.onTransform(context, source)
        );
      }
    }

    if (this.#options.onPostTransform) {
      source = await Promise.resolve(
        this.#options.onPostTransform(context, source)
      );
    }

    if (options.onPostTransform) {
      source = await Promise.resolve(options.onPostTransform(context, source));
    }

    return source.code.toString();
  }

  /**
   * Transpile the module.
   *
   * @param context - The compiler context.
   * @param id - The name of the file to compile.
   * @param code - The source code to compile.
   * @returns The transpiled module.
   */
  public async transpile(
    context: Context,
    id: string,
    code: string | MagicString,
    options: TranspileOptions = {}
  ): Promise<string> {
    const source = this.getSourceFile(id, code);

    return this.transpileModule(context, source, options);
  }

  /**
   * Compile the source code.
   *
   * @param context - The compiler context.
   * @param id - The name of the file to compile.
   * @param code - The source code to compile.
   * @returns The compiled source code and source map.
   */
  public async compile(
    context: Context,
    id: string,
    code: string | MagicString,
    options: CompileOptions = {}
  ): Promise<string> {
    this.log(LogLevelLabel.TRACE, `Compiling ${id}`);

    const source = this.getSourceFile(id, code);

    let transpiled: string | undefined;
    if (!options.skipCache) {
      transpiled = await this.getCache(context, source);
      if (transpiled) {
        this.log(LogLevelLabel.TRACE, `Cache hit: ${source.id}`);
      } else {
        this.log(LogLevelLabel.TRACE, `Cache miss: ${source.id}`);
      }
    }

    if (!transpiled) {
      transpiled = await this.transpileModule(context, source, options);
      await this.setCache(context, source, transpiled);
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
  public getSourceFile(id: string, code?: string | MagicString): SourceFile {
    const content = code ?? readFileIfExistingSync(id);

    return {
      id,
      code: getMagicString(content),
      env: []
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

  protected async getCache(context: Context, sourceFile: SourceFile) {
    let cache = this.#cache.get(sourceFile);
    if (cache) {
      return cache;
    }

    if (context.options.skipCache) {
      return;
    }

    cache = await getCache(sourceFile, this.cacheDir);
    if (cache) {
      this.#cache.set(sourceFile, cache);
    }

    return cache;
  }

  protected async setCache(
    context: Context,
    sourceFile: SourceFile,
    transpiled?: string
  ) {
    if (transpiled) {
      this.#cache.set(sourceFile, transpiled);
    } else {
      this.#cache.delete(sourceFile);
    }

    if (context.options.skipCache) {
      return;
    }

    return setCache(sourceFile, this.cacheDir, transpiled);
  }

  /**
   * Transpile the module.
   *
   * @param context - The compiler context.
   * @param source - The compiler source file.
   * @param options - The transpile options.
   * @returns The transpiled module.
   */
  protected async transpileModule(
    context: Context,
    source: SourceFile,
    options: TranspileOptions = {}
  ): Promise<string> {
    this.log(
      LogLevelLabel.TRACE,
      `Transpiling ${source.id} module with TypeScript compiler`
    );

    const transpiled = ts.transpileModule(
      await this.transform(context, source.id, source.code, options),
      {
        compilerOptions: {
          ...context.tsconfig.options,
          configFilePath: context.options.tsconfig
        },
        fileName: source.id,
        transformers: {
          before: [transformer],
          after: [declarationTransformer]
        }
      }
    );

    if (transpiled === null) {
      this.log(LogLevelLabel.ERROR, `Transform is null: ${source.id}`);

      throw new Error(`Transform is null: ${source.id}`);
    } else {
      this.log(LogLevelLabel.TRACE, `Transformed: ${source.id}`);
    }

    return transpiled.outputText;
  }
}
