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

import type { CompileOptions, Context, Options } from "@storm-stack/core/types";
import { normalizeWindowsPath } from "@stryke/path/correct-path";
import type { Options as TsupOptions } from "tsup";

/**
 * Extract the element of an array that also works for array union.
 *
 * Returns `never` if T is not an array.
 *
 * It creates a type-safe way to access the element type of `unknown` type.
 */
export type ArrayElement<T> = T extends readonly unknown[] ? T[0] : never;

export function tsupPlugin<TOptions extends Options = Options>(
  context: Context<TOptions>,
  options?: CompileOptions
): ArrayElement<TsupOptions["plugins"]> {
  return {
    name: "storm-stack:compiler",

    async renderChunk(code, info) {
      if (!/\.(?:cjs|js|mjs)$/.test(info.path)) {
        return;
      }

      const result = await context.compiler.compile(
        context,
        normalizeWindowsPath(info.path),
        code,
        options
      );

      return {
        code: result,
        map: info.map
      };
    }
  };
}
