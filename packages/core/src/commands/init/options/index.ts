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

import { formatLogMessage } from "@storm-software/config-tools/logger/console";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { joinPaths } from "@stryke/path/join-paths";
import { isString } from "@stryke/type-checks/is-string";
import { defaultEnvironmentName } from "../../../base/options";
import type { EngineHooks } from "../../../types/build";
import { Context } from "../../../types/context";

export async function initOptions(context: Context, hooks: EngineHooks) {
  context.log(
    LogLevelLabel.TRACE,
    `Initializing the processing options for the Storm Stack project.`
  );

  if (context.packageJson) {
    if (context.options.command === "new") {
      context.options.workspaceConfig.repository ??= isString(
        context.packageJson.repository
      )
        ? context.packageJson.repository
        : context.packageJson.repository?.url;
    } else {
      if (context.packageJson?.name) {
        context.options.name ??= context.packageJson?.name;
      }

      context.options.description ??= context.packageJson?.description;
      context.options.workspaceConfig.repository ??=
        typeof context.packageJson?.repository === "string"
          ? context.packageJson.repository
          : context.packageJson?.repository?.url;
    }
  } else if (context.options.command !== "new") {
    throw new Error(
      `The package.json file is missing in the project root directory: ${context.options.projectRoot}. Please run the "new" command to create a new Storm Stack project.`
    );
  }

  if (context.projectJson) {
    context.options.projectType ??= context.projectJson.projectType;
    context.options.name ??= context.projectJson.name;

    if (
      context.options.name?.startsWith("@") &&
      context.options.name.split("/").filter(Boolean).length > 1
    ) {
      context.options.name = context.options.name
        .split("/")
        .filter(Boolean)[1]!;
    }
  }

  context.options.tsconfig ??= joinPaths(
    context.options.projectRoot,
    "tsconfig.json"
  );

  context.options.override ??= {};
  context.options.external ??= [];
  context.options.noExternal ??= [];

  context.options.variant ??= "standalone";
  context.options.environment ??= defaultEnvironmentName(context.options);

  await hooks.callHook("init:options", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occurred while initializing the options for the Storm Stack project: ${
        error.message
      } \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while initializing the options for the Storm Stack project",
      { cause: error }
    );
  });

  if (
    context.options.variant === "esbuild" ||
    context.options.variant === "tsup" ||
    context.options.variant === "standalone"
  ) {
    context.options.build.target ??= "esnext";
    if (
      context.options.variant !== "standalone" ||
      context.options.projectType === "application"
    ) {
      context.options.build.format ??= "esm";
    }
  }

  context.log(
    LogLevelLabel.TRACE,
    `Initialized the processing options for the Storm Stack project: \n\n${formatLogMessage(context.options)}`
  );
}
