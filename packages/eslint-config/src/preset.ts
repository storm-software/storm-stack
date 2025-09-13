/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getStormConfig } from "@storm-software/eslint";
import type { OptionsConfig as BaseOptionsConfig } from "@storm-software/eslint/types";
import { OptionsTypescript } from "@storm-software/eslint/types";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import defu from "defu";
import type { Linter } from "eslint";
import type { Awaitable, FlatConfigComposer } from "eslint-flat-config-utils";
import { globals } from "eslint-plugin-storm-stack/configs/globals";
import { stormStack } from "./configs/storm-stack";
import type { OptionsConfig, TypedFlatConfigItem } from "./types";
import { getOverrides } from "./utilities/get-overrides";

/**
 * Get the ESLint configuration for a Storm Stack project. This is generally invoked from a `eslint.config.ts` / `eslint.config.js` file in the workspace's root.
 *
 * @remarks
 * This function returns a flat ESLint configuration that can be used in Storm Stack projects. It also includes the ESLint configuration added by the [\@storm-software/eslint](https://www.npmjs.com/package/\@storm-software/eslint) preset.
 *
 * @param options - The preset options applied to the ESLint configuration.
 * @param userConfigs - Additional ESLint configurations.
 */
export async function getConfig(
  options: OptionsConfig & Omit<TypedFlatConfigItem, "files"> = {},
  ...userConfigs: Awaitable<
    | TypedFlatConfigItem
    | TypedFlatConfigItem[]
    | FlatConfigComposer<object, string>
    | Linter.Config[]
  >[]
) {
  const configs: TypedFlatConfigItem[] = [];
  if (options["storm-stack"] ?? true) {
    const config = await stormStack({
      overrides: getOverrides(options, "storm-stack"),
      defaultConfig:
        typeof options["storm-stack"] === "string"
          ? options["storm-stack"]
          : "recommended"
    });
    configs.push(...config);
  }

  const tsdoc = options["tsdoc"];
  delete options["tsdoc"];

  return getStormConfig(
    defu((options as Omit<BaseOptionsConfig, "tsdoc">) ?? {}, {
      typescript: {
        override: {
          "ts/consistent-type-imports": [
            "warn",
            {
              disallowTypeAnnotations: false,
              fixStyle: "separate-type-imports",
              prefer: "type-imports"
            }
          ]
        }
      } as OptionsTypescript,
      tsdoc:
        tsdoc === false
          ? false
          : isSetObject(tsdoc)
            ? tsdoc
            : {
                configFile: `@storm-stack/tsdoc/${tsdoc || "recommended"}.json`
              },
      globals
    }),
    ...(userConfigs as any[])
  ).append(configs);
}

export const defineConfig = getConfig;
export default getConfig;
