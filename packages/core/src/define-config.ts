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

import { DeepPartial } from "@stryke/types/base";
import {
  UserConfigExport,
  UserConfigFn,
  UserConfigFnObject,
  UserConfigFnPromise
} from "./types/build";
import type { UserConfig } from "./types/config";

/**
 * Type helper to make it easier to use storm.config.ts
 *
 * @remarks
 * The function accepts a direct {@link UserConfig} object, or a function that returns it. The function receives a {@link ConfigEnv} object.
 */
export function defineConfig(
  config: DeepPartial<UserConfig>
): DeepPartial<UserConfig>;
export function defineConfig(
  config: Promise<DeepPartial<UserConfig>>
): Promise<DeepPartial<UserConfig>>;
export function defineConfig(config: UserConfigFnObject): UserConfigFnObject;
export function defineConfig(config: UserConfigFnPromise): UserConfigFnPromise;
export function defineConfig(config: UserConfigFn): UserConfigFn;
export function defineConfig(config: UserConfigExport): UserConfigExport;
export function defineConfig(config: UserConfigExport): UserConfigExport {
  return config;
}
