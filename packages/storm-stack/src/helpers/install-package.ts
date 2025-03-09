/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { install } from "@stryke/fs/package/install";
import { isPackageListed } from "@stryke/fs/package/package-fns";
import { isNumber } from "@stryke/types/type-checks/is-number";
import type { InferResolvedOptions, Options } from "../types/build";
import type { LogFn } from "../types/config";

/**
 * Installs a package if it is not already installed.
 *
 * @param log - The logger function
 * @param options - The resolved options
 * @param packageName - The name of the package to install
 * @param dev - Whether to install the package as a dev dependency
 */
export async function installPackage<
  TOptions extends Options = Options,
  TResolvedOptions extends
    InferResolvedOptions<TOptions> = InferResolvedOptions<TOptions>
>(log: LogFn, options: TResolvedOptions, packageName: string, dev = false) {
  const isInstalled = await isPackageListed(packageName, options.projectRoot);
  if (!isInstalled) {
    if (options.skipInstalls !== true) {
      log(
        LogLevelLabel.WARN,
        `The package "${packageName}" is not installed. It will be installed automatically.`
      );

      const result = await install(packageName, {
        cwd: options.projectRoot,
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
