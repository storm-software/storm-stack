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
import { readJsonFile } from "@stryke/fs/read-file";
import { removeFile } from "@stryke/fs/remove-file";
import { hashDirectory } from "@stryke/hash/hash-files";
import { existsSync } from "@stryke/path/exists";
import { relativeToWorkspaceRoot } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import type { PackageJson } from "@stryke/types/package-json";
import { nanoid } from "@stryke/unique-id/nanoid-client";
import type {
  Context,
  EngineHooks,
  MetaInfo,
  Options
} from "../../types/build";
import type { LogFn } from "../../types/config";

export async function initContext<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  hooks: EngineHooks<TOptions>
) {
  log(
    LogLevelLabel.TRACE,
    `Initializing the context for the Storm Stack project.`
  );

  const packageJsonPath = joinPaths(
    context.options.projectRoot,
    "package.json"
  );
  if (existsSync(packageJsonPath)) {
    context.packageJson = await readJsonFile<PackageJson>(packageJsonPath);
    context.options.name ??= context.packageJson?.name;
    context.options.description ??= context.packageJson?.description;
    context.workspaceConfig.repository ??=
      typeof context.packageJson?.repository === "string"
        ? context.packageJson.repository
        : context.packageJson?.repository?.url;
  } else if (context.commandId === "new") {
    const workspacePackageJsonPath = joinPaths(
      context.workspaceConfig.workspaceRoot,
      "package.json"
    );
    context.packageJson = await readJsonFile<PackageJson>(
      workspacePackageJsonPath
    );

    context.workspaceConfig.repository ??=
      typeof context.packageJson?.repository === "string"
        ? context.packageJson.repository
        : context.packageJson?.repository?.url;
  } else {
    throw new Error(
      `The package.json file is missing in the project root directory: ${context.options.projectRoot}. Please run the "new" command to create a new Storm Stack project.`
    );
  }

  context.relativeToWorkspaceRoot = relativeToWorkspaceRoot(
    context.options.projectRoot
  );

  const projectJsonPath = joinPaths(
    context.options.projectRoot,
    "project.json"
  );
  if (existsSync(projectJsonPath)) {
    context.projectJson = await readJsonFile(projectJsonPath);
    context.options.projectType ??= context.projectJson?.projectType;

    context.options.name ??= context.projectJson?.name;
    if (
      context.options.name?.startsWith("@") &&
      context.options.name.split("/").filter(Boolean).length > 1
    ) {
      context.options.name = context.options.name.split("/").filter(Boolean)[1];
    }
  }

  const checksum = await hashDirectory(context.options.projectRoot, {
    ignore: ["node_modules", ".git", ".nx", ".cache", ".storm", "tmp"]
  });
  context.meta ??= {
    buildId: nanoid(24),
    releaseId: nanoid(24),
    checksum,
    timestamp: Date.now()
  };

  context.artifactsPath ??= joinPaths(
    context.workspaceConfig.workspaceRoot,
    context.options.projectRoot,
    ".storm"
  );
  context.runtimePath ??= joinPaths(context.artifactsPath, "runtime");

  const metaFilePath = joinPaths(context.artifactsPath, "meta.json");
  try {
    if (existsSync(metaFilePath)) {
      context.persistedMeta = await readJsonFile<MetaInfo>(metaFilePath);
    }
  } catch {
    context.persistedMeta = undefined;
    await removeFile(metaFilePath);
  }

  context.options.platform ??= "neutral";
  context.options.dts ??= joinPaths(
    context.workspaceConfig.workspaceRoot,
    context.options.projectRoot,
    "storm.d.ts"
  );

  context.override.bundle ??= true;
  context.override.target ??= "esnext";
  context.override.format ??= "esm";

  context.override.alias ??= {};
  context.override.alias["storm:init"] ??= joinPaths(
    context.runtimePath,
    "init"
  );
  context.override.alias["storm:error"] ??= joinPaths(
    context.runtimePath,
    "error"
  );
  context.override.alias["storm:id"] ??= joinPaths(context.runtimePath, "id");
  context.override.alias["storm:storage"] ??= joinPaths(
    context.runtimePath,
    "storage"
  );
  context.override.alias["storm:log"] ??= joinPaths(context.runtimePath, "log");
  context.override.alias["storm:payload"] ??= joinPaths(
    context.runtimePath,
    "payload"
  );
  context.override.alias["storm:result"] ??= joinPaths(
    context.runtimePath,
    "result"
  );

  context.override.external ??= [];

  context.override.noExternal ??= [];
  if (Array.isArray(context.override.noExternal)) {
    context.override.noExternal.push(
      "storm:init",
      "storm:error",
      "storm:id",
      "storm:storage",
      "storm:log",
      "storm:payload",
      "storm:result"
    );
  }

  if (context.options.platform === "node") {
    context.override.platform ??= "node";
    context.override.target ??= "node22";

    context.override.alias["storm:app"] ??= joinPaths(
      context.runtimePath,
      "app"
    );
    context.override.alias["storm:context"] ??= joinPaths(
      context.runtimePath,
      "context"
    );
    context.override.alias["storm:env"] ??= joinPaths(
      context.runtimePath,
      "env"
    );
    context.override.alias["storm:event"] ??= joinPaths(
      context.runtimePath,
      "event"
    );

    if (Array.isArray(context.override.noExternal)) {
      context.override.noExternal.push(
        "storm:app",
        "storm:context",
        "storm:env",
        "storm:event"
      );
    }
  }

  await hooks.callHook("init:context", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occurred while initializing the context for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while initializing the context for the Storm Stack project",
      { cause: error }
    );
  });
}
