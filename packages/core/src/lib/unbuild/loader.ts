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

import type { Loader, LoaderResult } from "@storm-software/unbuild/types";
import { transform } from "esbuild";
import type { Context } from "../../types/context";

const TS_EXTS = new Set([".ts", ".mts", ".cts"]);

export const getUnbuildLoader = (context: Context): Loader => {
  return async (input, { options }) => {
    if (
      !/\.(?:c|m)?[jt]sx?$/.test(input.path) ||
      /\.d\.[cm]?ts$/.test(input.path)
    ) {
      return;
    }

    const output: LoaderResult = [];

    let contents = await input.getContents();

    // declaration
    if (options.declaration && !input.srcPath?.match(/\.d\.[cm]?ts$/)) {
      const cm = input.srcPath?.match(/(?<=\.)(?:c|m)(?=[jt]s$)/)?.[0] || "";
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
          ...Object.fromEntries(
            Object.entries(options.esbuild ?? {}).filter(
              ([key]) => key !== "absPaths"
            )
          ),
          loader: "ts"
        }
      ).then(r => r.code);
    } else if ([".tsx", ".jsx"].includes(input.extension)) {
      contents = await transform(
        await context.compiler.compile(context, input.path, contents),
        {
          loader: input.extension === ".tsx" ? "tsx" : "jsx",
          ...Object.fromEntries(
            Object.entries(options.esbuild ?? {}).filter(
              ([key]) => key !== "absPaths"
            )
          )
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
