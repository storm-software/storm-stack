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

import type { UnbuildOptions as BaseUnbuildOptions } from "@storm-software/unbuild/types";
import { resolveExternalESBuildOptions } from "@storm-stack/core/helpers/esbuild/options";
import { Context } from "@storm-stack/core/types/build";
import { UnbuildOverrideOptions } from "@storm-stack/core/types/config";
import { joinPaths } from "@stryke/path/join-paths";
import { isObject } from "@stryke/type-checks/is-object";
import defu from "defu";
import { getUnbuildLoader } from "./loader";

export function resolveUnbuildOptions(
  context: Context,
  override: Partial<UnbuildOverrideOptions> = {}
): BaseUnbuildOptions {
  const result = defu(
    override,
    context.options.unbuild.override ?? {},
    { ...context.options.unbuild, override: undefined },
    {
      projectName: context.options.name,
      name: context.options.name,
      orgName: isObject(context.options.organization)
        ? context.options.organization.name
        : context.options.organization,
      projectRoot: context.options.projectRoot,
      outputPath: context.options.outputPath || "dist",
      platform: context.options.platform,
      external: context.options.external,
      alias: context.options.alias,
      debug: context.options.mode === "development",
      minify: context.options.mode !== "development",
      sourcemap: context.options.mode === "development",
      loaders: [getUnbuildLoader(context)],
      env: context.dotenv.values as {
        [key: string]: string;
      },
      jiti: {
        interopDefault: true,
        fsCache: joinPaths(context.envPaths.cache, "jiti"),
        moduleCache: true
      },
      rollup: {
        esbuild: resolveExternalESBuildOptions(context)
      }
    },
    {
      dts: true,
      clean: false,
      includeSrc: false,
      treeShaking: true,
      splitting: true,
      watch: false,
      stub: false,
      watchOptions: {},
      outputPath: "dist",
      generatePackageJson: true,
      banner:
        context.options.mode !== "production"
          ? "\n//  ⚡  Built with Storm Stack \n"
          : " "
    }
  ) as unknown;

  return result as BaseUnbuildOptions;
}
