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

import type { Plugin } from "esbuild";
import { Context } from "../../types/context";

export const vfsPlugin = (context: Context): Plugin => {
  return {
    name: "storm-stack:virtual-file-system",
    setup(build) {
      build.onLoad({ filter: /.*/ }, async args => {
        if (args.path && context.vfs.isVirtualFile(args.path)) {
          const resolvedPath = context.vfs.resolvePath(args.path);
          if (resolvedPath) {
            const contents = await context.vfs.readFile(resolvedPath);
            if (!contents) {
              return;
            }

            return {
              contents,
              pluginData: args.pluginData
            };
          }
        }

        // eslint-disable-next-line no-useless-return
        return;
      });
    }
  };
};
