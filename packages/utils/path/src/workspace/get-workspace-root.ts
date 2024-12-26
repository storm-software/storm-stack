/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import { createStormConfig } from "@storm-software/config-tools";
import { PackageManagerLockFiles } from "@storm-stack/types/utility-types/package-manager";
import { findWorkspaceRoot } from "nx/src/utils/find-workspace-root";
import { readJsonFile } from "../utilities/file-utils";
import { getParentPath } from "../utilities/get-parent-path";
import { isRootDir } from "../utilities/is-root-dir";

/**
 * Get the workspace root path
 *
 * @param dir - A directory to start the search from
 * @returns The workspace root path
 */
export const getWorkspaceRoot = (dir = process.cwd()) => {
  if (process.env.STORM_WORKSPACE_ROOT || process.env.NX_WORKSPACE_ROOT_PATH) {
    return (process.env.STORM_WORKSPACE_ROOT ||
      process.env.NX_WORKSPACE_ROOT_PATH)!;
  }

  const config = createStormConfig();
  if (config?.workspaceRoot) {
    return config.workspaceRoot;
  }

  const root = findWorkspaceRoot(dir);
  if (root?.dir) {
    return root?.dir;
  }

  let result = getParentPath(
    [
      PackageManagerLockFiles.NPM,
      PackageManagerLockFiles.YARN,
      PackageManagerLockFiles.PNPM,
      PackageManagerLockFiles.BUN,
      "nx.json",
      "pnpm-workspace.yaml",
      "LICENSE",
      ".editorconfig",
      ".all-contributorsrc",
      ".whitesource",
      "syncpack.config.js",
      "syncpack.json",
      "socket.yaml",
      ".npmrc",
      ".log4brains.yml",
      ".huskyrc",
      ".husky",
      ".lintstagedrc",
      ".commitlintrc",
      "lefthook.yml",
      ".github",
      ".nx",
      ".vscode",
      "patches"
    ],
    dir
  );
  if (result) {
    return result;
  }

  result = dir;
  while (result && !isRootDir(result)) {
    result = getParentPath("storm.json", result, { skipCwd: true });
    if (result) {
      const configFile = readJsonFile(result);
      if (configFile.isRoot) {
        return result;
      }
    }
  }

  return "/";
};
