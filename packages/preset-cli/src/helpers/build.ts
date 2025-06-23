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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { Context, LogFn } from "@storm-stack/core/types";
import { esbuild } from "@storm-stack/devkit/helpers/esbuild/build";
import { unbuild } from "@storm-stack/devkit/helpers/unbuild/build";
import { chmodX } from "@stryke/fs/chmod-x";
import { findFileExtension } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { replacePath } from "@stryke/path/replace";
import type { Plugin as ESBuildPlugin } from "esbuild";

/**
 * ink attempts to import react-devtools-core in an ESM-unfriendly way:
 *
 * https://github.com/vadimdemedes/ink/blob/eab6ef07d4030606530d58d3d7be8079b4fb93bb/src/reconciler.ts#L22-L45
 *
 * to make this work, we have to strip the import out of the build.
 */
const ignoreReactDevToolsPlugin: ESBuildPlugin = {
  name: "ignore-react-devtools",
  setup(build) {
    // When an import for 'react-devtools-core' is encountered,
    // return an empty module.
    build.onResolve({ filter: /^react-devtools-core$/ }, args => {
      return { path: args.path, namespace: "ignore-devtools" };
    });
    build.onLoad({ filter: /.*/, namespace: "ignore-devtools" }, () => {
      return { contents: "", loader: "js" };
    });
  }
};

export async function buildApplication(log: LogFn, context: Context) {
  log(LogLevelLabel.TRACE, "Building the CLI application.");

  await esbuild(context, {
    entry: context.entry
      .filter(entry => entry.input.file === context.options.entry)
      .reduce(
        (ret, entry) => {
          ret[
            entry.output ||
              replacePath(
                entry.input.file,
                context.projectJson?.sourceRoot || context.options.projectRoot
              ).replace(findFileExtension(entry.input.file), "") ||
              replacePath(
                entry.file,
                context.projectJson?.sourceRoot || context.options.projectRoot
              ).replace(findFileExtension(entry.file), "")
          ] = entry.file;

          return ret;
        },
        {} as Record<string, string>
      ),
    distDir: "dist",
    esbuildPlugins: [ignoreReactDevToolsPlugin]
  });
}

export async function buildLibrary(log: LogFn, context: Context) {
  log(LogLevelLabel.TRACE, "Building the CLI library project.");

  await unbuild(context);
}

export async function permissionExecutable(log: LogFn, context: Context) {
  if (context.options.projectType === "application") {
    const filtered = context.entry.filter(
      entry => entry.input.file === context.options.entry
    );
    if (filtered.length === 0 || !filtered[0]?.output) {
      log(LogLevelLabel.WARN, "Unable to find executable file paths.");
      return;
    }

    const executablePath = joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.outputPath || "dist",
      "dist",
      `${filtered[0]?.output}.mjs`
    );

    log(
      LogLevelLabel.TRACE,
      `Adding executable permissions to the CLI application at ${executablePath}.`
    );

    await chmodX(executablePath);
  }
}
