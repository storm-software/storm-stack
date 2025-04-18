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

import type { Context, Options } from "@storm-stack/core/types/build";
import { noop } from "@stryke/helpers/noop";
import { joinPaths } from "@stryke/path/join-paths";
import defu from "defu";
import type { BuildOptions } from "esbuild";
import { build as esbuild } from "esbuild";
import { compilerPlugin } from "./compiler-plugin";
import { externalPlugin } from "./external-plugin";

export async function bundle<TOptions extends Options = Options>(
  context: Context<TOptions>,
  entryPoint: string,
  outputDir: string,
  override: Partial<BuildOptions> = {}
) {
  const runtimeDir = joinPaths(
    context.workspaceConfig.workspaceRoot,
    context.projectRoot,
    context.runtimeDir
  );

  return esbuild(
    defu(override ?? {}, context.override, {
      entryPoints: [entryPoint],
      platform: "node",
      format: "esm",
      minify: false,
      sourcemap: false,
      bundle: true,
      treeShaking: true,
      keepNames: true,
      splitting: false,
      preserveSymlinks: true,
      outdir: outputDir,
      alias: {
        "storm:app": joinPaths(runtimeDir, "app"),
        "storm:context": joinPaths(runtimeDir, "context"),
        "storm:error": joinPaths(runtimeDir, "error"),
        "storm:event": joinPaths(runtimeDir, "event"),
        "storm:id": joinPaths(runtimeDir, "id"),
        "storm:log": joinPaths(runtimeDir, "log"),
        "storm:request": joinPaths(runtimeDir, "request"),
        "storm:response": joinPaths(runtimeDir, "response")
      },
      define: Object.entries(context.resolvedDotenv.values).reduce(
        (ret, [key, value]) => {
          ret[`process.env.${key}`] = JSON.stringify(value);
          ret[`import.meta.env.${key}`] = JSON.stringify(value);
          ret[`$storm.env.${key}`] = JSON.stringify(value);

          return ret;
        },
        {} as Record<string, string>
      ),
      plugins: [
        externalPlugin(
          noop,
          {
            skipNodeModulesBundle: true
          },
          context.resolvedTsconfig.tsconfigJson.compilerOptions?.paths
        ),
        compilerPlugin(noop, context)
      ]
    }) as BuildOptions
  );
}
