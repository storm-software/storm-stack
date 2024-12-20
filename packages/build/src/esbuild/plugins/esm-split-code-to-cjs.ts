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

import * as esbuild from "esbuild";

/**
 * Code splitting only works in ESM at the moment, this plugin will convert the
 * ESM code to CJS automatically after the build. Only works with `outdir` set.
 */
export const esmSplitCodeToCjs: esbuild.Plugin = {
  name: "storm-stack:esm-split-code-to-cjs",
  setup(build) {
    build.onEnd(async result => {
      const outFiles = Object.keys(result.metafile?.outputs ?? {});
      const jsFiles = outFiles.filter(f => f.endsWith("js"));

      await esbuild.build({
        outdir: build.initialOptions.outdir,
        entryPoints: jsFiles,
        allowOverwrite: true,
        format: "cjs",
        logLevel: "error",
        packages: "external"
      });
    });
  }
};
