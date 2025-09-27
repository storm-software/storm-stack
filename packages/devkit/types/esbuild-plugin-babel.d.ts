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

declare module "esbuild-plugin-babel" {
  import type { Plugin } from "esbuild";

  interface BabelPluginOptions {
    /**
     * Babel configuration options.
     *
     * @remarks
     * This can be a path to a Babel configuration file (e.g., `.babelrc`, `babel.config.js`) or an object containing Babel options.
     *
     * @defaultValue `undefined`
     */
    config?: string | object;

    /**
     * Filter to determine which files should be processed by Babel.
     *
     * @remarks
     * This can be a regular expression or a function that takes a file path and returns a boolean indicating whether the file should be processed.
     *
     * @defaultValue `/\.(js|mjs|cjs|ts|tsx)$/`
     */
    filter?: RegExp | ((filePath: string) => boolean);

    /**
     * Whether to exclude files in `node_modules` from being processed by Babel.
     *
     * @defaultValue `true`
     */
    excludeNodeModules?: boolean;
  }

  /**
   * Creates an esbuild plugin that integrates Babel for transpiling files.
   *
   * @param options - Options to configure the Babel plugin.
   * @returns An esbuild plugin that uses Babel for transpilation.
   */
  function pluginBabel(options?: BabelPluginOptions): Plugin;

  export default pluginBabel;
}
