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

import {
  PackageManagerLockFiles,
  PackageManagers
} from "@storm-stack/types/utility-types/package-manager";
import { basename } from "node:path";
import { getParentPath } from "../utilities/get-parent-path";
import { getWorkspaceRoot } from "./get-workspace-root";

/**
 * Get the package manager used in the project
 * @param dir - The path to the project
 * @returns The package manager used in the project
 */
export function getPackageManager(dir = getWorkspaceRoot()): PackageManagers {
  const lockFile = getParentPath(
    [
      PackageManagerLockFiles.NPM,
      PackageManagerLockFiles.YARN,
      PackageManagerLockFiles.PNPM,
      PackageManagerLockFiles.BUN
    ],
    dir
  );

  if (!lockFile) {
    // default use pnpm
    return PackageManagers.PNPM;
  }

  switch (basename(lockFile)) {
    case PackageManagerLockFiles.YARN: {
      return PackageManagers.YARN;
    }
    case PackageManagerLockFiles.PNPM: {
      return PackageManagers.PNPM;
    }
    case PackageManagerLockFiles.BUN: {
      return PackageManagers.BUN;
    }
    default: {
      return PackageManagers.NPM;
    }
  }
}
