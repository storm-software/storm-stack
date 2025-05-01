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

import { getOverrides as getBaseOverrides } from "@storm-software/eslint";
import type { OptionsConfig as BaseOptionsConfig } from "@storm-software/eslint/types";
import type { Linter } from "eslint";
import type { OptionsConfig, RuleOptions } from "../types";

export function getOverrides(
  options: OptionsConfig,
  configName: keyof OptionsConfig
): Partial<Linter.RulesRecord & RuleOptions> {
  return getBaseOverrides(options, configName as keyof BaseOptionsConfig);
}
