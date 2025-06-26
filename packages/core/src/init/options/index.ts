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
import { isAbsolutePath } from "@stryke/path/is-file";
import { joinPaths } from "@stryke/path/join-paths";
import { defaultEnvironmentName } from "../../helpers/utilities/config";
import type { Context, EngineHooks } from "../../types/build";
import type { LogFn } from "../../types/config";

export async function initOptions(
  log: LogFn,
  context: Context,
  hooks: EngineHooks
) {
  log(
    LogLevelLabel.TRACE,
    `Initializing the processing options for the Storm Stack project.`
  );

  if (context.packageJson) {
    if (context.options.command === "new") {
      context.options.repository ??=
        typeof context.packageJson.repository === "string"
          ? context.packageJson.repository
          : context.packageJson.repository?.url;
    } else {
      if (context.packageJson?.name) {
        context.options.name ??= context.packageJson?.name;
      }

      context.options.description ??= context.packageJson?.description;
      context.workspaceConfig.repository ??=
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

  context.options.esbuild.override ??= {};
  context.options.alias ??= {};
  context.options.alias["storm:init"] ??= joinPaths(
    context.runtimePath,
    "init"
  );
  context.options.alias["storm:error"] ??= joinPaths(
    context.runtimePath,
    "error"
  );
  context.options.alias["storm:id"] ??= joinPaths(context.runtimePath, "id");
  context.options.alias["storm:storage"] ??= joinPaths(
    context.runtimePath,
    "storage"
  );
  context.options.alias["storm:log"] ??= joinPaths(context.runtimePath, "log");
  context.options.alias["storm:payload"] ??= joinPaths(
    context.runtimePath,
    "payload"
  );
  context.options.alias["storm:result"] ??= joinPaths(
    context.runtimePath,
    "result"
  );

  context.options.tsconfig ??= joinPaths(
    context.options.projectRoot,
    "tsconfig.json"
  );
  context.options.platform ??= "neutral";
  context.options.dts ??= joinPaths(context.options.projectRoot, "storm.d.ts");
  context.options.errorsFile = context.options.errorsFile
    ? context.options.errorsFile.startsWith(
        context.workspaceConfig.workspaceRoot
      ) || isAbsolutePath(context.options.errorsFile)
      ? context.options.errorsFile
      : joinPaths(
          context.workspaceConfig.workspaceRoot,
          context.options.errorsFile
        )
    : joinPaths(
        context.workspaceConfig.workspaceRoot,
        "tools/errors/codes.json"
      );

  context.options.esbuild.bundle ??= true;
  context.options.esbuild.target ??= "esnext";
  context.options.esbuild.format ??= "esm";
  context.options.esbuild.override ??= {};

  context.options.external ??= [];
  context.options.noExternal ??= [];

  await hooks.callHook("init:context", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occurred while initializing the context for the Storm Stack project: ${
        error.message
      } \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while initializing the context for the Storm Stack project",
      { cause: error }
    );
  });

  if (context.options.platform === "node") {
    context.options.esbuild.target ??= "node22";

    context.options.esbuild.override ??= {};
    context.options.alias ??= {};
    context.options.alias["storm:app"] ??= joinPaths(
      context.runtimePath,
      "app"
    );
    context.options.alias["storm:context"] ??= joinPaths(
      context.runtimePath,
      "context"
    );
    context.options.alias["storm:env"] ??= joinPaths(
      context.runtimePath,
      "env"
    );
    context.options.alias["storm:event"] ??= joinPaths(
      context.runtimePath,
      "event"
    );

    if (Array.isArray(context.options.noExternal)) {
      // context.options.noExternal.push(
      //   ...context.vfs.getRuntime().map(file => file.path)
      // );
      context.options.noExternal.push(...Object.keys(context.options.alias));
    }
  }

  context.options.environment ??= defaultEnvironmentName(context.options);

  await hooks.callHook("init:options", context).catch((error: Error) => {
    log(
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

  log(
    LogLevelLabel.TRACE,
    "Initialized the processing options for the Storm Stack project."
  );
}
