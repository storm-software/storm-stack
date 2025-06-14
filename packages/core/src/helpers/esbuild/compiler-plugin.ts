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

import { readFile } from "@stryke/fs/read-file";
import { normalizeWindowsPath } from "@stryke/path/correct-path";
import type { Plugin } from "esbuild";
import type { CompileOptions, Context, Options } from "../../types";

export function compilerPlugin<TOptions extends Options = Options>(
  context: Context<TOptions>,
  options?: CompileOptions
): Plugin {
  return {
    name: "storm-stack:compiler",
    setup(build) {
      build.onLoad({ filter: /\.ts$/ }, async args => {
        return {
          contents: await context.compiler.compile(
            context,
            normalizeWindowsPath(args.path),
            await readFile(args.path),
            options
          )
        };
      });
    }
  };
}
