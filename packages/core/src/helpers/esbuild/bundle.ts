/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { Entry } from "@storm-software/build-tools/types";
import { ESBuildOverrideOptions } from "@storm-stack/core/types/config";
import { isString } from "@stryke/type-checks/is-string";
import { build as esbuild } from "esbuild";
import type {
  CompileOptions,
  Context,
  ResolvedOptions
} from "../../types/build";
import { resolveExternalESBuildOptions } from "./options";

export type BundleOptions = CompileOptions &
  Pick<ResolvedOptions, "external" | "noExternal" | "skipNodeModulesBundle"> & {
    entry?: Entry;
    outputPath?: string;
  };

export async function bundle(
  context: Context,
  override: Partial<ESBuildOverrideOptions> = {},
  bundleOptions: BundleOptions = {}
) {
  const options = await resolveExternalESBuildOptions(
    context,
    {
      outdir: bundleOptions.outputPath,
      entryPoints: bundleOptions.entry
        ? Array.isArray(bundleOptions.entry)
          ? bundleOptions.entry
          : isString(bundleOptions.entry)
            ? [bundleOptions.entry]
            : Object.values(bundleOptions.entry)
        : [],
      ...override
    },
    bundleOptions
  );

  try {
    return esbuild(options);
  } catch (error) {
    console.error("Error occurred while bundling:", error);
    throw error;
  }
}
