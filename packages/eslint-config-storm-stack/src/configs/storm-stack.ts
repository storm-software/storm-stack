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

import { GLOB_CODE_FILE } from "@storm-software/eslint/utils/constants";
import type { Linter } from "eslint";
import { configs } from "eslint-plugin-storm-stack/configs";
import { pluginStormStack } from "../plugins";
import type { OptionsStormStack, TypedFlatConfigItem } from "../types";

export async function stormStack(
  options: OptionsStormStack = {}
): Promise<TypedFlatConfigItem[]> {
  const {
    files = [GLOB_CODE_FILE],
    overrides = {},
    defaultConfig = "recommended"
  } = options;

  let config: Linter.Config<Linter.RulesRecord> = {};
  if (defaultConfig !== "none") {
    config = configs[defaultConfig];
  }

  return [
    {
      files,
      name: "storm/storm-stack/setup",
      plugins: {
        "storm-stack": pluginStormStack
      },
      ignores: [".storm", "**/.storm"]
    },
    {
      name: "storm/storm-stack/rules",
      rules: {
        ...config.rules,

        ...overrides
      }
    }
  ];
}
