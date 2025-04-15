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

import { combine } from "@storm-software/eslint/utils/combine";
import { writeFile } from "@stryke/fs/write-file";
import { flatConfigsToRulesDTS } from "eslint-typegen/core";
import { builtinRules } from "eslint/use-at-your-own-risk";
import { stormStack } from "../src/configs";

const configs = await combine(
  {
    plugins: {
      "": {
        rules: Object.fromEntries(builtinRules.entries())
      }
    }
  },
  stormStack()
);

const dts = await flatConfigsToRulesDTS(configs, {
  includeAugmentation: false
});

await writeFile(
  "src/typegen.d.ts",
  `${dts}
  // Names of all the configs
  export type ConfigNames = ${(configs.map(i => i.name).filter(Boolean) as string[]).map(i => `'${i}'`).join(" | ")}
  `
);
