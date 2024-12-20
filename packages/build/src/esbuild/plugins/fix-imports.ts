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

import type * as esbuild from "esbuild";

/**
 * For dependencies that forgot to add them into their package.json.
 */
export const fixImportsPlugin: esbuild.Plugin = {
  name: "storm-stack:fix-imports",
  setup(build) {
    build.onResolve({ filter: /^spdx-exceptions/ }, () => {
      return { path: require.resolve("spdx-exceptions") };
    });
    build.onResolve({ filter: /^spdx-license-ids/ }, () => {
      return { path: require.resolve("spdx-license-ids") };
    });
  }
};
