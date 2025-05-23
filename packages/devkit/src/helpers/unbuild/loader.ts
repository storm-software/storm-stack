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

import type { Loader, LoaderResult } from "@storm-software/unbuild/types";
import type { Context, Options } from "@storm-stack/core/types/build";
import { transform } from "esbuild";

const DECLARATION_RE = /\.d\.[cm]?ts$/;
const CM_LETTER_RE = /(?<=\.)(?:c|m)(?=[jt]s$)/;

const KNOWN_EXT_RE = /\.(?:c|m)?[jt]sx?$/;

const TS_EXTS = new Set([".ts", ".mts", ".cts"]);

export const getUnbuildLoader = <TOptions extends Options = Options>(
  context: Context<TOptions>
): Loader => {
  return async (input, { options }) => {
    if (!KNOWN_EXT_RE.test(input.path) || DECLARATION_RE.test(input.path)) {
      return;
    }

    const output: LoaderResult = [];

    let contents = await input.getContents();

    // declaration
    if (options.declaration && !input.srcPath?.match(DECLARATION_RE)) {
      const cm = input.srcPath?.match(CM_LETTER_RE)?.[0] || "";
      const extension = `.d.${cm}ts`;
      output.push({
        contents,
        srcPath: input.srcPath,
        path: input.path,
        extension,
        declaration: true
      });
    }

    // typescript => js
    if (TS_EXTS.has(input.extension)) {
      contents = await transform(
        await context.compiler.compile(context, input.path, contents),
        {
          ...options.esbuild,
          loader: "ts"
        }
      ).then(r => r.code);
    } else if ([".tsx", ".jsx"].includes(input.extension)) {
      contents = await transform(
        await context.compiler.compile(context, input.path, contents),
        {
          loader: input.extension === ".tsx" ? "tsx" : "jsx",
          ...options.esbuild
        }
      ).then(r => r.code);
    }

    // esm => cjs
    const isCjs = options.format === "cjs";
    if (isCjs) {
      contents = context.resolver
        .transform({
          source: contents,
          retainLines: false
        })
        .replace(/^exports.default = /gm, "module.exports = ")
        .replace(/^var _default = exports.default = /gm, "module.exports = ")
        .replace("module.exports = void 0;", "");
    }

    let extension = isCjs ? ".js" : ".mjs"; // TODO: Default to .cjs in next major version
    if (options.ext) {
      extension = options.ext.startsWith(".") ? options.ext : `.${options.ext}`;
    }

    output.push({
      contents,
      path: input.path,
      extension
    });

    return output;
  };
};
