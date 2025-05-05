#!/usr/bin/env -S pnpm tsx
/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { combine } from "@storm-software/eslint/utils/combine";
import chalkTemplate from "chalk-template";
import { flatConfigsToRulesDTS } from "eslint-typegen/core";
import { builtinRules } from "eslint/use-at-your-own-risk";
import { writeFile } from "node:fs/promises";
import { stormStack } from "../src/configs";

try {
  console.log(
    chalkTemplate`{whiteBright 📦  Generating ESLint configuration types... }`
  );

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
export type ConfigNames = ${configs
      .map(i => i.name)
      .filter(Boolean)
      .map(i => `'${i}'`)
      .join(" | ")}
    `,
    { encoding: "utf-8" }
  );

  console.log(
    chalkTemplate`{green Completed ESLint configuration types generation successfully! }`
  );
} catch (error) {
  console.log(
    chalkTemplate`{red ${error?.message ? error.message : "A failure occurred while generating ESLint configuration types"} }`
  );

  process.exit(1);
}
