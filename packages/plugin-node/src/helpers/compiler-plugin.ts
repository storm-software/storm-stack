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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { Context, LogFn, Options } from "@storm-stack/core/types";
import { readFile } from "@stryke/fs/read-file";
import { normalizeWindowsPath } from "@stryke/path/correct-path";
import type { Plugin } from "esbuild";

export function compilerPlugin<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>
): Plugin {
  return {
    name: "storm-stack:compiler",
    setup(build) {
      build.onLoad({ filter: /\.ts$/ }, async args => {
        log(
          LogLevelLabel.TRACE,
          `Transforming ${args.path} with Storm Stack compiler`
        );

        return {
          contents: await context.compiler.compile(
            context,
            normalizeWindowsPath(args.path),
            await readFile(args.path)
          )
        };
      });
    }
  };
}
