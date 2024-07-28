import { execute } from "@storm-stack/cli";
import { basename, resolve } from "node:path";
import { exists } from "../files/exists";
import { joinPaths } from "../files/join-paths";

export type PackageManagers = "npm" | "yarn" | "pnpm" | "bun";
export const PackageManagers = {
  NPM: "npm" as PackageManagers,
  YARN: "yarn" as PackageManagers,
  PNPM: "pnpm" as PackageManagers,
  BUN: "bun" as PackageManagers
};

function findUp(names: string[], cwd: string): string | undefined {
  let dir = cwd;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const target = names.find(name => exists(joinPaths(dir, name)));
    if (target) return target;

    const up = resolve(dir, "..");
    if (up === dir) return undefined; // it'll fail anyway
    dir = up;
  }
}

function getPackageManager(projectPath = "."): PackageManagers {
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

export function installPackage(
  pkg: string,
  dev: boolean,
  pkgManager: PackageManagers | undefined = undefined,
  tag = "latest",
  projectPath = ".",
  exactVersion = true
) {
  const manager = pkgManager ?? getPackageManager(projectPath);
  console.log(`Installing package "${pkg}@${tag}" with ${manager}`);
  switch (manager) {
    case "yarn": {
      execute(
        `yarn --cwd "${projectPath}" add ${exactVersion ? "--exact" : ""} ${pkg}@${tag} ${
          dev ? " --dev" : ""
        }`
      );
      break;
    }

    case "pnpm": {
      execute(
        `pnpm add -C "${projectPath}" ${exactVersion ? "--save-exact" : ""} ${
          dev ? " --save-dev" : ""
        } ${pkg}@${tag}`
      );
      break;
    }

    case "bun": {
      execute(
        `bun add ${exactVersion ? "--exact" : ""} ${dev ? " --dev" : ""} ${pkg}@${tag}`,
        {
          cwd: projectPath
        }
      );
      break;
    }

    default: {
      execute(
        `npm install --prefix "${projectPath}" ${exactVersion ? "--save-exact" : ""} ${
          dev ? " --save-dev" : ""
        } ${pkg}@${tag}`
      );
      break;
    }
  }
}

export function ensurePackage(
  pkg: string,
  dev: boolean,
  pkgManager: PackageManagers | undefined = undefined,
  tag = "latest",
  projectPath = ".",
  exactVersion = false
) {
  const resolvePath = resolve(projectPath);
  try {
    require.resolve(pkg, { paths: [resolvePath] });
  } catch {
    installPackage(pkg, dev, pkgManager, tag, resolvePath, exactVersion);
  }
}
