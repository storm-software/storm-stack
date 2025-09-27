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

import { MaybePromise } from "@stryke/types/base";
import MagicString, { SourceMap } from "magic-string";
import { ResolvedBabelOptions } from "./build";
import { Context } from "./context";
import { ReflectionLevel, ReflectionMode } from "./tsconfig";

/**
 * The result of the compiler
 */
export type CompilerResult =
  | {
      code: string;
      map: SourceMap | null;
    }
  | undefined;

/**
 * The format for providing source code to the compiler
 */
export interface SourceFile {
  /**
   * The name of the file to be compiled
   */
  id: string;

  /**
   * The source code to be compiled
   */
  code: MagicString;

  /**
   * The environment variables used in the source code
   */
  env: string[];

  /**
   * The transpiled source code
   */
  result?: CompilerResult;
}

export interface TranspilerOptions {
  /**
   * The reflection mode to use for the transformation.
   *
   * @defaultValue "default"
   */
  reflectionMode?: ReflectionMode;

  /**
   * The reflection level to use for the transformation.
   *
   * @defaultValue "minimal"
   */
  reflectionLevel?: ReflectionLevel;
}

export interface CompilerOptions<TContext = any> extends TranspilerOptions {
  /**
   * Skip the cache.
   *
   * @defaultValue false
   */
  skipCache?: boolean;

  /**
   * Transform the source file before other transformations.
   *
   * @param context - The context object
   * @param source - The source file
   * @returns The transformed source file
   */
  onPreTransform?: (
    context: TContext,
    source: SourceFile
  ) => MaybePromise<SourceFile>;

  /**
   * Transform the source file after transformations.
   *
   * @param context - The context object
   * @param source - The source file
   * @returns The transformed source file
   */
  onPostTransform?: (
    context: TContext,
    source: SourceFile
  ) => MaybePromise<SourceFile>;

  /**
   * A filter function to determine if the source file should be compiled.
   *
   * @param sourceFile - The source file
   * @returns Whether the source file should be compiled
   */
  filter?: (sourceFile: SourceFile) => boolean;

  /**
   * Skip all transformations.
   *
   * @defaultValue false
   */
  skipAllTransforms?: boolean;

  /**
   * Skip the unimport transformation.
   *
   * @defaultValue false
   */
  skipTransformUnimport?: boolean;

  /**
   * Override the Babel options for the transformation.
   */
  babel?: Partial<ResolvedBabelOptions>;
}

export interface CompilerInterface<TContext extends Context = Context> {
  /**
   * Get the result of the compiler.
   *
   * @param sourceFile - The source file.
   * @param transpiled - The transpiled source code.
   * @returns The result of the compiler.
   */
  getResult: (sourceFile: SourceFile, transpiled?: string) => CompilerResult;

  /**
   * Transpile the module.
   *
   * @param context - The context object
   * @param id - The name of the file to transpile
   * @param code - The source code to transpile
   * @param options - The transpile options
   * @returns The transpiled module.
   */
  transpile: (
    context: TContext,
    id: string,
    code: string | MagicString,
    options?: TranspilerOptions
  ) => Promise<string>;

  /**
   * Transform the module.
   *
   * @param context - The context object
   * @param id - The name of the file to transpile
   * @param code - The source code to transpile
   * @param options - The transpile options
   * @returns The transpiled module.
   */
  transform: (
    context: TContext,
    id: string,
    code: string | MagicString,
    options?: CompilerOptions
  ) => Promise<string>;

  /**
   * Run the compiler.
   *
   * @param context - The context object
   * @param id - The name of the file to compile
   * @param code - The source code to compile
   * @param options - The compiler options
   * @returns The compiled source code
   */
  compile: (
    context: TContext,
    id: string,
    code: string | MagicString,
    options?: CompilerOptions
  ) => Promise<string>;
}
