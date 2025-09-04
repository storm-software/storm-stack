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

import { joinPaths } from "@stryke/path/join-paths";
import { isObject } from "@stryke/type-checks/is-object";
import defu from "defu";
import { UnbuildOptions } from "../../types/config";
import { Context } from "../../types/context";
import { resolveESBuildOptions } from "../esbuild/options";
import { getUnbuildLoader } from "./loader";

export function resolveUnbuildOptions(
  context: Context,
  override: Partial<UnbuildOptions> = {}
): UnbuildOptions {
  return defu(
    override,
    context.options.variant === "unbuild" ||
      (context.options.variant === "standalone" &&
        context.options.projectType === "library")
      ? context.options.override
      : {},
    {
      projectName: context.options.name,
      name: context.options.name,
      orgName: isObject(context.options.organization)
        ? context.options.organization.name
        : context.options.organization,
      projectRoot: context.options.projectRoot,
      outputPath: context.options.output.outputPath || "dist",
      platform: context.options.platform,
      external: context.vfs.runtimeIdMap.keys().reduce((ret, id) => {
        if (!ret.includes(id)) {
          ret.push(id);
        }

        return ret;
      }, context.options.external ?? []),
      debug: context.options.mode === "development",
      minify: context.options.mode !== "development",
      sourcemap: context.options.mode === "development",
      loaders: [getUnbuildLoader(context)],
      jiti: {
        interopDefault: true,
        fsCache: joinPaths(context.envPaths.cache, "jiti"),
        moduleCache: true
      },
      rollup: {
        esbuild: resolveESBuildOptions(context)
      }
    },
    context.options.variant === "unbuild" ||
      (context.options.variant === "standalone" &&
        context.options.projectType === "library")
      ? context.options.build
      : {},
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
  ) as any;
}
