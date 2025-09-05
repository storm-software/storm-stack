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

import {
  BabelPluginOptions,
  BabelPluginState
} from "@storm-stack/core/types/babel";
import { ResolvedOptions } from "@storm-stack/core/types/build";
import type { Context } from "@storm-stack/core/types/context";
import { PluginBaseOptions } from "@storm-stack/core/types/plugin";
import {
  ConfigPluginOptions,
  ConfigPluginReflectionRecord
} from "@storm-stack/plugin-config/types";
import type {
  ErrorPluginOptions,
  ErrorPluginResolvedOptions
} from "@storm-stack/plugin-error/types";
import {
  LogConsolePluginOptions,
  LogConsolePluginResolvedOptions
} from "@storm-stack/plugin-log-console/types";
import { PluginOptions } from "babel-plugin-react-compiler";

export interface ReactPluginOptions extends PluginBaseOptions {
  /**
   * Control where the JSX factory is imported from.
   *
   * @see https://esbuild.github.io/api/#jsx-import-source
   *
   * @defaultValue "react"
   */
  jsxImportSource?: string;

  /**
   * Control how JSX is transformed.
   *
   * @remarks
   * Skipping React import with classic runtime is not supported from v4
   *
   * @defaultValue "automatic"
   */
  jsxRuntime?: "classic" | "automatic";

  /**
   * Options provided to the [React Compiler](https://npmjs.com/package/babel-plugin-react-compiler).
   *
   * @see https://github.com/facebook/react/blob/main/compiler/packages/babel-plugin-react-compiler/src/Entrypoint/Options.ts#L55
   * @see https://react.dev/blog/2025/04/21/react-compiler-rc
   *
   * @remarks
   * Set to `false` to disable the React Compiler. By default, the React Compiler is enabled and target is set to React 19.
   */
  compiler?: PluginOptions | false;

  /**
   * Options for the config plugin.
   */
  config?: ConfigPluginOptions;

  /**
   * Options for the error plugin.
   */
  error?: Omit<ErrorPluginOptions, "config">;

  /**
   * Options for the console log plugin.
   */
  console?: LogConsolePluginOptions;
}

export interface ReactPluginResolvedOptions
  extends ErrorPluginResolvedOptions,
    LogConsolePluginResolvedOptions {}

export type ReactPluginContext<
  TOptions extends ReactPluginResolvedOptions = ReactPluginResolvedOptions
> = Context<ResolvedOptions<TOptions>, ConfigPluginReflectionRecord>;

export type ReactBabelPluginState = BabelPluginState<BabelPluginOptions>;
