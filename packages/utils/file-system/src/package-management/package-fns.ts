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

import { basename, resolve } from "node:path";
import { exists } from "../files/exists";
import { joinPaths } from "../files/join-paths";
import { PackageManagers } from "../types";

function findUp(names: string[], cwd: string): string | undefined {
  let dir = cwd;

  while (true) {
    const target = names.find(name => exists(joinPaths(dir, name)));
    if (target) return target;

    const up = resolve(dir, "..");
    if (up === dir) return undefined; // it'll fail anyway
    dir = up;
  }
}

export function getPackageManager(projectPath = "."): PackageManagers {
  const lockFile = findUp(
    ["yarn.lock", "pnpm-lock.yaml", "package-lock.json", "bun.lockb"],
    projectPath
  );

  if (!lockFile) {
    // default use pnpm
    return "pnpm";
  }

  switch (basename(lockFile)) {
    case "yarn.lock": {
      return "yarn";
    }
    case "pnpm-lock.yaml": {
      return "pnpm";
    }
    case "bun.lockb": {
      return "bun";
    }
    default: {
      return "npm";
    }
  }
}
