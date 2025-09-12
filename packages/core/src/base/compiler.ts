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
import { existsSync } from "@stryke/fs/exists";
import { createDirectorySync } from "@stryke/fs/helpers";
import { resolvePackage } from "@stryke/fs/resolve";
import { isParentPath } from "@stryke/path/is-parent-path";
import { joinPaths } from "@stryke/path/join-paths";
import type MagicString from "magic-string";
import { transform } from "../lib/babel/transform";
import { extendLog } from "../lib/logger";
import { transpile } from "../lib/typescript/transpile";
import { getCache, setCache } from "../lib/utilities/cache";
import { getSourceFile, getString } from "../lib/utilities/source-file";
import { generateSourceMap } from "../lib/utilities/source-map";
import {
  CompilerInterface,
  CompilerOptions,
  CompilerResult,
  SourceFile,
  TranspilerOptions
} from "../types/compiler";
import { LogFn } from "../types/config";
import { Context } from "../types/context";

export class Compiler<TContext extends Context = Context>
  implements CompilerInterface<TContext>
{
  #cache: WeakMap<SourceFile, string> = new WeakMap();

  #options: CompilerOptions<TContext>;

  #corePath: string | undefined;

  /**
   * The logger function to use
   */
  protected log: LogFn;

  /**
   * The cache directory
   */
  protected cacheDir: string;

  /**
   * Create a new compiler instance.
   *
   * @param context - The compiler context.
   * @param options - The compiler options.
   */
  constructor(context: TContext, options: CompilerOptions<TContext> = {}) {
    this.log = extendLog(context.log, "compiler");
    this.#options = options;

    this.cacheDir = joinPaths(context.cachePath, "compiler");
    if (!existsSync(this.cacheDir)) {
      createDirectorySync(this.cacheDir);
    }
  }

  /**
   * Transform the module.
   *
   * @param context - The compiler context.
   * @param fileName - The name of the file to compile.
   * @param code - The source code to compile.
   * @param options - The transpile options.
   * @returns The transpiled module.
   */
  public async transform(
    context: TContext,
    fileName: string,
    code: string | MagicString,
    options: CompilerOptions = {}
  ): Promise<string> {
    if (await this.shouldSkip(context, fileName, code)) {
      this.log(LogLevelLabel.TRACE, `Skipping transform for ${fileName}`);
      return getString(code);
    }

    this.log(LogLevelLabel.TRACE, `Transforming ${fileName}`);

    let source = getSourceFile(fileName, code);

    if (options.onPreTransform) {
      this.log(
        LogLevelLabel.TRACE,
        `Running onPreTransform hook for ${source.id}`
      );

      source = await Promise.resolve(options.onPreTransform(context, source));
    }

    if (this.#options.onPreTransform) {
      this.log(
        LogLevelLabel.TRACE,
        `Running onPreTransform hook for ${source.id}`
      );

      source = await Promise.resolve(
        this.#options.onPreTransform(context, source)
      );
    }

    if (!options.skipAllTransforms) {
      if (
        context.unimport &&
        !options.skipTransformUnimport &&
        !context.vfs.isRuntimeFile(fileName)
      ) {
        source = await context.unimport.injectImports(source);
      }

      this.log(
        LogLevelLabel.TRACE,
        `Running transforms for ${source.id} with options: ${JSON.stringify(
          options
        )}`
      );

      source = await transform(this.log, context, source, options);
      this.log(LogLevelLabel.TRACE, `Transformed: ${source.id}`);
    }

    if (this.#options.onPostTransform) {
      this.log(
        LogLevelLabel.TRACE,
        `Running onPostTransform hook for ${source.id}`
      );

      source = await Promise.resolve(
        this.#options.onPostTransform(context, source)
      );
    }

    if (options.onPostTransform) {
      this.log(
        LogLevelLabel.TRACE,
        `Running onPostTransform hook for ${source.id}`
      );

      source = await Promise.resolve(options.onPostTransform(context, source));
    }

    return getString(source.code);
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
    context: TContext,
    id: string,
    code: string | MagicString,
    options: TranspilerOptions = {}
  ): Promise<string> {
    this.log(
      LogLevelLabel.TRACE,
      `Transpiling ${id} module with TypeScript compiler`
    );

    const transpiled = transpile(context, id, getString(code), options);
    if (transpiled === null) {
      this.log(LogLevelLabel.ERROR, `Transform is null: ${id}`);

      throw new Error(`Transform is null: ${id}`);
    } else {
      this.log(LogLevelLabel.TRACE, `Transformed: ${id}`);
    }

    return transpiled.outputText;
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
    context: TContext,
    id: string,
    code: string | MagicString,
    options: CompilerOptions = {}
  ): Promise<string> {
    this.log(LogLevelLabel.TRACE, `Compiling ${id}`);

    const source = getSourceFile(id, code);

    let compiled: string | undefined;
    if (!options.skipCache) {
      compiled = await this.getCache(context, source);
      if (compiled) {
        this.log(LogLevelLabel.TRACE, `Cache hit: ${source.id}`);
      } else {
        this.log(LogLevelLabel.TRACE, `Cache miss: ${source.id}`);
      }
    }

    if (!compiled) {
      const transformed = await this.transform(
        context,
        source.id,
        source.code,
        options
      );

      compiled = await this.transpile(context, id, transformed, options);
      await this.setCache(context, source, compiled);
    }

    return compiled;
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

  protected async getCache(context: TContext, sourceFile: SourceFile) {
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
    context: TContext,
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

  protected async shouldSkip(
    context: TContext,
    id: string,
    code: string | MagicString
  ): Promise<boolean> {
    if (!this.#corePath) {
      this.#corePath = process.env.STORM_STACK_LOCAL
        ? joinPaths(context.options.workspaceRoot, "packages/core")
        : await resolvePackage("@storm-stack/core");
      if (!this.#corePath) {
        throw new Error(
          "Could not resolve @storm-stack/core package location."
        );
      }
    }

    if (
      (process.env.STORM_STACK_LOCAL && isParentPath(id, this.#corePath)) ||
      getString(code).includes("/* @storm-ignore */") ||
      getString(code).includes("/* @storm-disable */")
    ) {
      return true;
    }

    return false;
  }
}
