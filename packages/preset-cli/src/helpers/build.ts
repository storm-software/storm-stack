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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { LogFn } from "@storm-stack/core/types";
import type { Options } from "@storm-stack/core/types/build";
import { esbuild } from "@storm-stack/devkit/helpers/esbuild/build";
import { unbuild } from "@storm-stack/devkit/helpers/unbuild/build";
import { chmodX } from "@stryke/fs/chmod-x";
import { findFileExtension } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import type { StormStackCLIPresetContext } from "../types/build";

export async function buildApplication<TOptions extends Options = Options>(
  log: LogFn,
  context: StormStackCLIPresetContext<TOptions>
) {
  log(LogLevelLabel.TRACE, "Building the CLI application.");

  await esbuild(context, {
    entry: context.entry
      .filter(entry => entry.input.file === context.options.entry)
      .reduce(
        (ret, entry) => {
          ret[
            entry.output ||
              entry.input.file
                .replace(
                  `${context.projectJson?.sourceRoot || context.options.projectRoot}/`,
                  ""
                )
                .replace(findFileExtension(entry.input.file), "") ||
              entry.file
                .replace(
                  `${context.projectJson?.sourceRoot || context.options.projectRoot}/`,
                  ""
                )
                .replace(findFileExtension(entry.file), "")
          ] = entry.file;

          return ret;
        },
        {} as Record<string, string>
      ),
    distDir: "dist"
  });
}

export async function buildLibrary<TOptions extends Options = Options>(
  log: LogFn,
  context: StormStackCLIPresetContext<TOptions>
) {
  log(LogLevelLabel.TRACE, "Building the CLI library project.");

  await unbuild(context);
}

export async function permissionExecutable<TOptions extends Options = Options>(
  log: LogFn,
  context: StormStackCLIPresetContext<TOptions>
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
