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

import { installPackage, InstallPackageOptions } from "@antfu/install-pkg";
/**
 * Install a package
 *
 * @param name - The name of the package to install
 * @param options - The options to use when installing the package
 * @returns The result of the command or an exception
 */
export const install = (
  names: string | string[],
  options?: InstallPackageOptions
) => {
  return installPackage(names, options);
};
