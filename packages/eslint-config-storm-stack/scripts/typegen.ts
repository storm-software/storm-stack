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
import { flatConfigsToRulesDTS } from "eslint-typegen/core";
import { builtinRules } from "eslint/use-at-your-own-risk";
import fs from "node:fs/promises";
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

const configNames = configs.map(i => i.name).filter(Boolean) as string[];

let dts = await flatConfigsToRulesDTS(configs, {
  includeAugmentation: false
});

dts += `
// Names of all the configs
export type ConfigNames = ${configNames.map(i => `'${i}'`).join(" | ")}
`;

await fs.writeFile("src/typegen.d.ts", dts);
