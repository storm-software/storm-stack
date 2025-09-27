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

import { Plugin } from "rollup";

/**
 * A Rollup plugin to bundle TypeScript declaration files (.d.ts) alongside the JavaScript output files.
 *
 * @remarks
 * This plugin generates .d.ts files for each entry point in the bundle, ensuring that type definitions are available for consumers of the library.
 */
export const dtsBundlePlugin: Plugin = {
  name: "storm-stack:dts-bundle",
  async generateBundle(_opts, bundle) {
    for (const [, file] of Object.entries(bundle)) {
      if (
        file.type === "asset" ||
        !file.isEntry ||
        file.facadeModuleId == null
      ) {
        continue;
      }

      // Replace various JavaScript file extensions (e.g., .js, .cjs, .mjs, .cjs.js, .mjs.js) with .d.ts for generating type definition file names.
      const dtsFileName = file.fileName.replace(
        /(?:\.cjs|\.mjs|\.esm\.js|\.cjs\.js|\.mjs\.js|\.js)$/,
        ".d.ts"
      );

      const relativeSourceDtsName = JSON.stringify(
        `./${file.facadeModuleId.replace(/\.[cm]?[jt]sx?$/, "")}`
      );

      this.emitFile({
        type: "asset",
        fileName: dtsFileName,
        source: file.exports.includes("default")
          ? `export * from ${relativeSourceDtsName};\nexport { default } from ${relativeSourceDtsName};\n`
          : `export * from ${relativeSourceDtsName};\n`
      });
    }
  }
};
