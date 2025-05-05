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

import type {
  OptionsConfig as BaseOptionsConfig,
  TypedFlatConfigItem as BaseTypedFlatConfigItem,
  OptionsFiles,
  OptionsOverrides
} from "@storm-software/eslint/types";
import type { Linter } from "eslint";
import type { ConfigNames, RuleOptions } from "./typegen";

export type Awaitable<T> = T | Promise<T>;

export type Rules = RuleOptions;

export type { ConfigNames };

export * from "./typegen.d";

export type TypedFlatConfigItem = Omit<
  Linter.Config<Linter.RulesRecord & Rules>,
  "plugins"
> &
  BaseTypedFlatConfigItem & {
    // Relax plugins type limitation, as most of the plugins did not have correct type info yet.
    /**
     * An object containing a name-value mapping of plugin names to plugin objects. When `files` is specified, these plugins are only available to the matching files.
     *
     * @see [Using plugins in your configuration](https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#using-plugins-in-your-configuration)
     */
    plugins?: Record<string, any>;
  };

/**
 * Storm Stack ESLint configuration options.
 */
export interface OptionsStormStack extends OptionsFiles, OptionsOverrides {
  /**
   * The configuration type to use as the defaults (before overrides are applied).
   *
   * @defaultValue "recommended"
   */
  defaultConfig?: "none" | "base" | "recommended" | "strict";
}

/**
 * Storm Stack ESLint configuration options.
 */
export interface OptionsConfig extends BaseOptionsConfig {
  /**
   * Enable storm-stack rules.
   *
   * Requires installing:
   * - `eslint-plugin-storm-stack`
   *
   * @defaultValue "recommended"
   */
  "storm-stack"?:
    | boolean
    | "base"
    | "recommended"
    | "strict"
    | OptionsStormStack;
}
