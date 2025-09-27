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

import type { Options } from "tsup";
import { defineConfig } from "tsup";
import { defaultOptions as sharedDefaultOptions } from "./tsup.shared";

export type TsupOptions = Partial<Options> &
  Pick<Options, "name" | "entryPoints">;

export const defaultOptions: TsupOptions = {
  ...sharedDefaultOptions,
  bundle: false,
  skipNodeModulesBundle: true
};

export function definePluginTsupConfig(options: TsupOptions | TsupOptions[]) {
  return Array.isArray(options)
    ? defineConfig(
        options.map(option => ({
          ...defaultOptions,
          onSuccess: async () => {
            // eslint-disable-next-line no-console
            console.log(
              `✅ ${option.name
                ?.replace(/^plugin-/, "")
                .replace(/-plugin$/, "")} plugin build completed successfully!`
            );
          },
          ...option
        }))
      )
    : defineConfig({
        ...defaultOptions,
        onSuccess: async () => {
          // eslint-disable-next-line no-console
          console.log(
            `✅ ${options.name?.replace(/^plugin-/, "").replace(/-plugin$/, "")} plugin build completed successfully!`
          );
        },
        ...options
      });
}
