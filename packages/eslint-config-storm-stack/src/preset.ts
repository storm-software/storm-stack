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

import { type PresetOptions, getStormConfig } from "@storm-software/eslint";
import baseConfig from "@storm-stack/eslint-plugin/configs/base";
import type { Linter } from "eslint";

/**
 * Get the ESLint configuration for a Storm Stack project.
 *
 * @remarks
 * This function returns a flat ESLint configuration that can be used in Storm Stack projects. It also includes the ESLint configuration added by the [\@storm-software/eslint](https://www.npmjs.com/package/\@storm-software/eslint) preset.
 *
 * @param options - The preset options.
 * @param userConfigs - Additional ESLint configurations.
 */
export function getESLintConfig(
  options: PresetOptions = {},
  ...userConfigs: Linter.Config[]
): Linter.Config[] {
  return getStormConfig(options, baseConfig, ...userConfigs);
}
