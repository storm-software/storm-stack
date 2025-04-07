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
import { hash } from "@stryke/hash/hash";
import { joinPaths } from "@stryke/path/join-paths";
import type MagicString from "magic-string";
import { ts } from "ts-morph";
import { getCache, setCache } from "./helpers/cache";
import { transformEnv } from "./helpers/transform/transform-env";
import { transformErrors } from "./helpers/transform/transform-errors";
import { createLog } from "./helpers/utilities/logger";
import { getMagicString } from "./helpers/utilities/magic-string";
import { generateSourceMap } from "./helpers/utilities/source-map";
import type { LogFn } from "./types";
import type {
  CompilerResult,
  Context,
  ICompiler,
  Options,
  SourceFile
} from "./types/build";

export class Compiler<TOptions extends Options = Options>
  implements ICompiler<TOptions>
{
  #cache: WeakMap<SourceFile, string> = new WeakMap();

  /**
   * The logger function to use
   */
  protected log: LogFn;

  /**
   * The cache directory
   */
  protected cacheDir: string;

  /**
   * A callback function to be called before the source file is compiled
   */
  protected onTransformCallback: (
    context: Context<TOptions>,
    sourceFile: SourceFile
  ) => Promise<void>;

  constructor(
    context: Context<TOptions>,
    onTransformCallback: (
      context: Context<TOptions>,
      sourceFile: SourceFile
    ) => Promise<void> = async () => {}
  ) {
    this.log = createLog("compiler", context);
    this.onTransformCallback = onTransformCallback;

    this.cacheDir = joinPaths(
      context.envPaths.cache,
      hash(context.resolvedTsconfig.options)
    );
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
    context: Context<TOptions>,
    id: string,
    code: string | MagicString
  ): Promise<string> {
    this.log(LogLevelLabel.TRACE, `Compiling ${id}`);

    const source = this.getSourceFile(id, code);

    let transpiled: string | undefined = await this.getCache(context, source);
    if (transpiled) {
      this.log(LogLevelLabel.TRACE, `Cache hit: ${source.id}`);
    } else {
      this.log(LogLevelLabel.TRACE, `Cache miss: ${source.id}`);
    }

    if (!transpiled) {
      transpiled = await this.transpileModule(context, source);
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
  public getSourceFile(id: string, code: string | MagicString): SourceFile {
    return {
      id,
      code: getMagicString(code),
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

  protected async getCache(context: Context<TOptions>, sourceFile: SourceFile) {
    let cache = this.#cache.get(sourceFile);
    if (cache) {
      return cache;
    }

    if (context.skipCache) {
      return;
    }

    cache = await getCache(sourceFile, this.cacheDir);
    if (cache) {
      this.#cache.set(sourceFile, cache);
    }

    return cache;
  }

  protected async setCache(
    context: Context<TOptions>,
    sourceFile: SourceFile,
    transpiled?: string
  ) {
    if (transpiled) {
      this.#cache.set(sourceFile, transpiled);
    } else {
      this.#cache.delete(sourceFile);
    }

    if (context.skipCache) {
      return;
    }

    return setCache(sourceFile, this.cacheDir, transpiled);
  }

  /**
   * Transpile the module.
   *
   * @param context - The compiler context.
   * @param source - The compiler source file.
   * @returns The transpiled module.
   */
  protected async transpileModule(
    context: Context<TOptions>,
    source: SourceFile
  ): Promise<string> {
    this.log(
      LogLevelLabel.TRACE,
      `Transpiling ${source.id} module with TypeScript compiler`
    );

    let transformed = await transformEnv<TOptions>(source, context);
    if (transformed.env.length > 0) {
      context.vars = transformed.env.reduce((ret, env) => {
        const property =
          context.resolvedDotenv.types?.variables?.properties?.[env];
        if (property) {
          ret[env] = property;
        }

        return ret;
      }, context.vars);
    }

    transformed = await transformErrors<TOptions>(transformed, context);

    await this.onTransformCallback(context, transformed);

    if (
      context.unimport &&
      !transformed.id.replaceAll("\\", "/").includes(context.runtimeDir)
    ) {
      transformed = await context.unimport.injectImports(transformed);
    }

    const transpiled = ts.transpileModule(transformed.code.toString(), {
      compilerOptions: {
        ...context.project.getCompilerOptions(),
        configFilePath: context.tsconfig
      },
      fileName: transformed.id,
      transformers: {
        before: [transformer],
        after: [declarationTransformer]
      }
    });

    if (transpiled === null) {
      this.log(LogLevelLabel.ERROR, `Transform is null: ${transformed.id}`);

      throw new Error(`Transform is null: ${transformed.id}`);
    } else {
      this.log(LogLevelLabel.TRACE, `Transformed: ${transformed.id}`);
    }

    return transpiled.outputText;
  }
}
