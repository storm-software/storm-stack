/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import { consola, LogType } from "consola";
import Diff from "diff-match-patch";
import MagicString, { SourceMap } from "magic-string";
import { dirname, resolve } from "pathe";
import { resolveTSConfig } from "pkg-types";
import ts from "typescript";
import { transform as typiaTransform } from "typia/lib/transform";
import type { Alias, ResolvedConfig } from "vite";
import type { ResolvedOptions } from "../types";
import type { Data, UnContext } from "./utilities";
import { Cache, wrap } from "./utilities";

/* eslint-disable eqeqeq */

const dmp = new Diff();

/** create a printer */
const printer = ts.createPrinter();

/** cache compilerOptions */
let compilerOptions: ts.CompilerOptions | undefined;

/** cache source files */
const sourceCache = new Map<string, ts.SourceFile>();

/**
 * Transform a TypeScript file with Typia.
 *
 * @param id - The file path.
 * @param source - The source code.
 * @param unpluginContext - The unplugin context.
 * @param options - The resolved options.
 * @param aliases - Path aliases to be resolved
 * @returns The transformed code.
 */
async function transformTypia(
  id: string,
  source: MagicString,
  unpluginContext: UnContext,
  options: ResolvedOptions,
  aliases?: Alias[]
): Promise<Data> {
  // const wrappedId = wrap<ID>(resolve(id));
  // const wrappedSource = wrap<Source>(source);

  /** Whether to enable cache */
  const cacheEnable = options.cache;

  /** parse tsconfig compilerOptions */
  compilerOptions = await getTsCompilerOption(cacheEnable, options.tsconfig);

  const { program, tsSource } = await getProgramAndSource(
    id,
    source,
    compilerOptions,
    aliases,
    cacheEnable
  );

  using result = transform(id, program, tsSource, options.typia);
  const { diagnostics, transformed, file } = result;

  warnDiagnostic(diagnostics, transformed, unpluginContext);

  const data = printer.printFile(file);
  return wrap<Data>(data);
}

/**
 * Read tsconfig.json and get compilerOptions.
 * @param cacheEnable - Whether to enable cache. @default true
 * @param tsconfigId - The tsconfig.json path. @default undefined
 */
async function getTsCompilerOption(
  cacheEnable = true,
  tsconfigId?: string
): Promise<ts.CompilerOptions> {
  const parseTsCompilerOptions = async () => {
    const readFile = (path: string) => ts.sys.readFile(path);
    const id =
      tsconfigId == null ? await resolveTSConfig() : resolve(tsconfigId);

    const tsconfigParseResult = ts.readConfigFile(id, readFile);

    if (tsconfigParseResult.error != null) {
      throw new Error(tsconfigParseResult.error.messageText.toString());
    }

    const tsconfig = ts.parseJsonConfigFileContent(
      tsconfigParseResult.config,
      ts.sys,
      dirname(id)
    );

    return tsconfig.options;
  };

  /** parse tsconfig compilerOptions */
  if (cacheEnable) {
    compilerOptions ??= await parseTsCompilerOptions();
  } else {
    compilerOptions = await parseTsCompilerOptions();
  }

  return compilerOptions;
}

/**
 * Get program and source.
 *
 * @param id - The file path.
 * @param source - The source code.
 * @param compilerOptions - The compiler options.
 * @param aliases - Alias list
 * @param cacheEnable - Whether to enable cache. @default true
 * @returns The program and source.
 */
async function getProgramAndSource(
  id: string,
  source: MagicString,
  compilerOptions: ts.CompilerOptions,
  aliases?: Alias[],
  cacheEnable = true
): Promise<{ program: ts.Program; tsSource: ts.SourceFile }> {
  const tsSource = ts.createSourceFile(
    id,
    source.toString(),
    compilerOptions.target ?? ts.ScriptTarget.ES2020
  );
  const host = ts.createCompilerHost(compilerOptions);

  /** when alias defined in config, resolve module with alias */

  if (aliases != null && aliases.length > 0) {
    /** resolve module with alias */
    host.resolveModuleNameLiterals = (
      moduleLiterals,
      containingFile,
      _,
      options
    ) => {
      return moduleLiterals.map(lit => {
        /* resolve module witoout alias */
        const module = ts.resolveModuleName(
          lit.text,
          containingFile,
          options,
          host,
          host.getModuleResolutionCache?.()
        );

        /* if module is resolved, return it */

        if (module.resolvedModule != null) {
          return module;
        }

        /* find matching alias */
        const alias = findMatchingAlias(lit.text, aliases);

        /* if no matching alias, return module */

        if (alias == null) {
          return module;
        }

        /* when alais is found and there is unresolved module, resolve it */
        return ts.resolveModuleName(
          resolve(lit.text.replace(alias.find, alias.replacement)),
          containingFile,
          options,
          host,
          host.getModuleResolutionCache?.()
        );
      });
    };
  }

  host.getSourceFile = (fileName, languageVersion) => {
    if (fileName === id) {
      return tsSource;
    }

    if (cacheEnable) {
      const cache = sourceCache.get(fileName);

      if (cache != null) {
        return cache;
      }
    }

    const source = ts.sys.readFile(fileName);

    if (source == null) {
      return undefined;
    }
    const result = ts.createSourceFile(fileName, source, languageVersion);

    if (cacheEnable) {
      sourceCache.set(fileName, result);
    }

    return result;
  };
  const program = ts.createProgram([id], compilerOptions, host);

  return { program, tsSource };
}

/**
 * Transform a TypeScript file with Typia.
 *
 * @param id - The file path.
 * @param program - The program.
 * @param tsSource - The source file.
 * @param typiaOptions - The Typia options.
 * @returns The transformed code and source map.
 */
function transform(
  id: string,
  program: ts.Program,
  tsSource: ts.SourceFile,
  typiaOptions?: ResolvedOptions["typia"]
): {
  /** The diagnostics */
  diagnostics: ts.Diagnostic[];
  /** The transformed source files */
  transformed: ts.SourceFile[];
  /** The transformed source file we need */
  file: ts.SourceFile;
  /** Dispose the transformation */
  [Symbol.dispose]: () => void;
} {
  const diagnostics: ts.Diagnostic[] = [];

  /** transform with Typia */
  const typiaTransformer = typiaTransform(program, typiaOptions, {
    addDiagnostic(diag) {
      return diagnostics.push(diag);
    }
  });

  /** transform with TypeScript */
  const transformationResult = ts.transform(tsSource, [typiaTransformer], {
    ...program.getCompilerOptions(),
    sourceMap: true,
    inlineSources: true
  });

  const file = transformationResult.transformed.find(
    t => resolve(t.fileName) === id
  );

  if (file == null) {
    throw new Error("No file found");
  }

  const { transformed } = transformationResult;

  return {
    diagnostics,
    transformed,
    file,
    [Symbol.dispose]: () => transformationResult.dispose()
  };
}

/**
 * Warn diagnostics.
 */
function warnDiagnostic(
  diagnostics: ts.Diagnostic[],
  transformed: ts.SourceFile[],
  unpluginContext: UnContext
) {
  for (const diagnostic of diagnostics) {
    const warn = (message => {
      if (unpluginContext?.warn != null) {
        return unpluginContext.warn(message);
      }
      return consola.warn(message);
    }) satisfies typeof unpluginContext.warn;

    warn(transformed.map(e => e.fileName).join(","));
    warn(JSON.stringify(diagnostic.messageText));
  }
}

/** Find matching alias */
function findMatchingAlias(text: string, aliases: Alias[]) {
  if (aliases.length > 0) {
    return aliases.find(alias => {
      if (typeof alias.find === "string") {
        return text.startsWith(alias.find);
      }
      return alias.find.test(text);
    });
  }

  return undefined;
}

/**
 * Generate code with source map.
 */
function generateCodeWithMap({
  source,
  code,
  id
}: {
  source: MagicString;
  code: Data;
  id: string;
}) {
  /** generate diff */
  const diff = dmp.diff_main(source, code);

  /** cleanup diff */
  dmp.diff_cleanupSemantic(diff);

  let offset = 0;
  for (let index = 0; index < diff.length; index++) {
    const [type, text] = diff[index];
    const textLength = text.length;
    /** skip */
    switch (type) {
      case 0: {
        /* offset is increased  */
        offset += textLength;

        break;
      }
      case 1: {
        /** add text */
        source.prependLeft(offset, text);

        /* offset is not increased because text is prepended */

        break;
      }
      case -1: {
        /** remove text */
        const next = diff.at(index + 1);

        /** if next is equal to 1, then overwrite */

        if (next != null && next[0] === 1) {
          const replaceText = next[1];

          /** get first non-whitespace character of text (maybe bug of magic-string) */
          const firstNonWhitespaceIndexOfText = text.search(/\S/);
          const offsetStart =
            offset +
            (firstNonWhitespaceIndexOfText > 0
              ? firstNonWhitespaceIndexOfText
              : 0);

          source.update(offsetStart, offset + textLength, replaceText);

          /** skip next */
          index += 1;
        } else {
          source.remove(offset, offset + textLength);
        }

        /* offset is increased  */
        offset += textLength;

        break;
      }
      // No default
    }
  }

  if (!source.hasChanged()) {
    return;
  }

  return {
    code: source.toString(),
    map: source.generateMap({
      source: id,
      file: `${id}.map`,
      includeContent: true
    })
  };
}

export async function generateCode({
  id,
  source,
  context,
  options,
  config,
  writeLog
}: {
  id: string;
  source: MagicString;
  context: UnContext;
  options: ResolvedOptions;
  config: Partial<ResolvedConfig>;
  writeLog: (type: LogType, ...args: string[]) => void;
}): Promise<
  | {
      code: string;
      map: SourceMap;
    }
  | undefined
> {
  // const wrappedSource = wrap<Source>(s.toString());
  // const wrappedId = wrap<ID>();

  /** get cache */
  using cache = options.cache ? new Cache(id, source.toString()) : undefined;
  let code = cache?.data;

  if (code == null) {
    writeLog("warn", `Cache miss: ${id}`);
  } else {
    writeLog("success", `Cache hit: ${id}`);
  }

  /** transform if cache not exists */
  if (code == null) {
    code = await transformTypia(
      id,
      source,
      context,
      options,
      config?.resolve?.alias
    );

    if (code == null) {
      writeLog("error", `Transform is null: ${id}`);
    } else {
      writeLog("success", `Transformed: ${id}`);
    }

    /** save cache */
    if (cache != null) {
      cache.data = code;
    }

    writeLog("success", `Cache set: ${id}`);
  }

  /** skip if code is null */
  if (code == null) {
    return;
  }

  return generateCodeWithMap({ source, code, id });
}
