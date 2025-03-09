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

import { getStormConfig } from "@storm-software/eslint";
import type {
  ConfigNames,
  OptionsConfig,
  TypedFlatConfigItem
} from "@storm-software/eslint/types";
import type { Linter } from "eslint";
import type { Awaitable, FlatConfigComposer } from "eslint-flat-config-utils";

/**
 * Get the ESLint configuration for a Storm Stack project.
 *
 * @remarks
 * This function returns a flat ESLint configuration that can be used in Storm Stack projects. It also includes the ESLint configuration added by the [\@storm-software/eslint](https://www.npmjs.com/package/\@storm-software/eslint) preset.
 *
 * @param options - The preset options.
 * @param userConfigs - Additional ESLint configurations.
 */
export async function getESLintConfig(
  options: OptionsConfig & Omit<TypedFlatConfigItem, "files">,
  ...userConfigs: Awaitable<
    | TypedFlatConfigItem
    | TypedFlatConfigItem[]
    | FlatConfigComposer<any, any>
    | Linter.Config[]
  >[]
): Promise<FlatConfigComposer<TypedFlatConfigItem, ConfigNames>> {
  return getStormConfig(options, ...userConfigs);
}
