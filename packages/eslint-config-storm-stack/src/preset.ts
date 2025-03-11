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

import { getOverrides, getStormConfig } from "@storm-software/eslint";
import type { Linter } from "eslint";
import type { Awaitable, FlatConfigComposer } from "eslint-flat-config-utils";
import { globals as stormStackGlobals } from "eslint-plugin-storm-stack/configs/globals";
import { stormStack } from "./configs/storm-stack";
import type { ConfigNames, OptionsConfig, TypedFlatConfigItem } from "./types";

/**
 * Get the ESLint configuration for a Storm Stack project.
 *
 * @remarks
 * This function returns a flat ESLint configuration that can be used in Storm Stack projects. It also includes the ESLint configuration added by the [\@storm-software/eslint](https://www.npmjs.com/package/\@storm-software/eslint) preset.
 *
 * @param options - The preset options.
 * @param userConfigs - Additional ESLint configurations.
 */
export async function getConfig(
  options: OptionsConfig & Omit<TypedFlatConfigItem, "files">,
  ...userConfigs: Awaitable<
    | TypedFlatConfigItem
    | TypedFlatConfigItem[]
    | FlatConfigComposer<any, any>
    | Linter.Config[]
  >[]
): Promise<FlatConfigComposer<TypedFlatConfigItem, ConfigNames>> {
  const { globals = {} } = options;

  const configs: TypedFlatConfigItem[] = [];
  if (options["storm-stack"] ?? true) {
    configs.push(
      ...(await stormStack({
        overrides: getOverrides(options, "storm-stack" as any),
        defaultConfig:
          typeof options["storm-stack"] === "string"
            ? options["storm-stack"]
            : "recommended"
      }))
    );
  }

  return getStormConfig(
    {
      ...options,
      globals: { ...globals, ...stormStackGlobals }
    },
    ...userConfigs
  ).append(configs);
}
