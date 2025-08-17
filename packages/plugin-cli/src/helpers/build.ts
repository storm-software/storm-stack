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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { esbuild } from "@storm-stack/core/lib/esbuild/build";
import { unbuild } from "@storm-stack/core/lib/unbuild/build";
import { LogFn } from "@storm-stack/core/types/config";
import { chmodX } from "@stryke/fs/chmod-x";
import { joinPaths } from "@stryke/path/join-paths";
import { CLIPluginContext } from "../types/config";

/**
 * ink attempts to import react-devtools-core in an ESM-unfriendly way:
 *
 * https://github.com/vadimdemedes/ink/blob/eab6ef07d4030606530d58d3d7be8079b4fb93bb/src/reconciler.ts#L22-L45
 *
 * to make this work, we have to strip the import out of the build.
 */
// const IgnoreReactDevToolsPlugin: ESBuildPlugin = {
//   name: "ignore-react-devtools",
//   setup(build) {
//     // When an import for 'react-devtools-core' is encountered,
//     // return an empty module.
//     build.onResolve({ filter: /^react-devtools-core$/ }, args => {
//       return { path: args.path, namespace: "ignore-devtools" };
//     });
//     build.onLoad({ filter: /.*/, namespace: "ignore-devtools" }, () => {
//       return { contents: "", loader: "js" };
//     });
//   }
// };

export async function buildApplication(log: LogFn, context: CLIPluginContext) {
  log(LogLevelLabel.TRACE, "Building the CLI application.");

  await esbuild(context, {
    entry: context.entry
      .filter(entry => entry.input.file === context.options.entry)
      .reduce(
        (ret, entry) => {
          ret[entry.output] = entry.file;

          return ret;
        },
        {} as Record<string, string>
      ),
    platform: "node",
    skipNodeModulesBundle: true
  });
}

export async function buildLibrary(log: LogFn, context: CLIPluginContext) {
  log(LogLevelLabel.TRACE, "Building the CLI library project.");

  await unbuild(context);
}

export async function permissionExecutable(
  log: LogFn,
  context: CLIPluginContext
) {
  if (context.options.projectType === "application") {
    const filtered = context.entry.filter(
      entry => entry.input.file === context.options.entry
    );
    if (filtered.length === 0 || !filtered[0]?.output) {
      log(LogLevelLabel.WARN, "Unable to find executable file paths.");
      return;
    }

    const executablePath = joinPaths(
      context.options.workspaceRoot,
      context.options.output.outputPath || "dist",
      "dist",
      context.options.esbuild.format === "esm"
        ? `${filtered[0]?.output}.mjs`
        : `${filtered[0]?.output}.js`
    );

    log(
      LogLevelLabel.TRACE,
      `Adding executable permissions to the CLI application at ${executablePath}.`
    );

    await chmodX(executablePath);
  }
}
