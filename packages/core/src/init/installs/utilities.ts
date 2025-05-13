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
import { install } from "@stryke/fs/install";
import { isPackageListed } from "@stryke/fs/package-fns";
import { isNumber } from "@stryke/type-checks/is-number";
import type { Context, Options } from "../../types/build";
import type { LogFn } from "../../types/config";

/**
 * Installs a package if it is not already installed.
 *
 * @param log - The logger function
 * @param context - The resolved options
 * @param packageName - The name of the package to install
 * @param dev - Whether to install the package as a dev dependency
 */
export async function installPackage<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  packageName: string,
  dev = false
) {
  const isInstalled = await isPackageListed(
    packageName,
    context.options.projectRoot
  );
  if (!isInstalled) {
    if (context.options.skipInstalls !== true) {
      log(
        LogLevelLabel.WARN,
        `The package "${packageName}" is not installed. It will be installed automatically.`
      );

      const result = await install(packageName, {
        cwd: context.options.projectRoot,
        dev
      });
      if (isNumber(result.exitCode) && result.exitCode > 0) {
        log(LogLevelLabel.ERROR, result.stderr);
        throw new Error(
          `An error occurred while installing the package "${packageName}"`
        );
      }
    } else {
      log(
        LogLevelLabel.WARN,
        `The package "${packageName}" is not installed. Since the "skipInstalls" option is set to true, it will not be installed automatically.`
      );
    }
  }
}

/**
 * Installs a package if it is not already installed.
 *
 * @param log - The logger function
 * @param context - The resolved options
 * @param packages - The list of packages to install
 */
export async function installPackages<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  packages: Array<{ name: string; dev?: boolean }>
) {
  return Promise.all(
    packages.map(async pkg => installPackage(log, context, pkg.name, pkg.dev))
  );
}
