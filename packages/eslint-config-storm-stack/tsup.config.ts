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

import { getTsupConfig } from "@storm-stack/tools-config/tsup.shared";
import type * as esbuild from "esbuild";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";

const plugin: esbuild.Plugin = {
  name: "storm:rules-dts",
  setup(build) {
    build.onStart(async () => {
      console.info("Generating rules.d.ts type definitions");
      const getConfig = await import("./src/preset").then(m => m.getConfig);

      const { flatConfigsToRulesDTS } = await import("eslint-typegen/core");
      const dts = await flatConfigsToRulesDTS(
        await getConfig({
          name: "storm-stack"
        }),
        {
          includeAugmentation: false
        }
      );
      if (!dts) {
        console.warn("No rules.d.ts generated");
        return;
      }

      if (existsSync("src/rules.d.ts")) {
        console.info("Cleaning previous rules.d.ts file");
        await fs.rm("src/rules.d.ts");
      }

      console.info("Writing rules.d.ts");
      await fs.writeFile("src/rules.d.ts", dts);
    });
  }
};

const config = getTsupConfig({
  name: "eslint-config",
  entry: ["src/*.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  clean: true,
  shims: false,
  external: ["eslint"],
  plugins: [plugin]
});

export default config;
