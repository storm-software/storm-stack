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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { isValidRange } from "@stryke/fs/semver-fns";
import {
  getPackageName,
  getPackageVersion,
  hasPackageVersion
} from "@stryke/string-format/package";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { isString } from "@stryke/type-checks/is-string";
import type { EngineHooks } from "../../../types/build";
import { Context } from "../../../types/context";
import { getSharedDeps } from "./shared";
import { installPackage } from "./utilities";

/**
 * Install missing project dependencies.
 *
 * @param context - The build context.
 * @param hooks - The engine hooks.
 */
export async function initInstall(
  context: Context,
  hooks: EngineHooks
): Promise<void> {
  context.log(
    LogLevelLabel.TRACE,
    `Checking and installing missing project dependencies.`
  );

  context.packageDeps = getSharedDeps(context);

  await hooks.callHook("init:install", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while installing project dependencies: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error("An error occured while installing project dependencies", {
      cause: error
    });
  });

  context.log(
    LogLevelLabel.TRACE,
    `The following packages must be installed as dependencies: \n${Object.keys(
      context.packageDeps
    )
      .map(
        key =>
          ` - ${getPackageName(key)}${
            hasPackageVersion(key) ||
            (isSetObject(context.packageDeps[key]) &&
              isSetString(context.packageDeps[key].version))
              ? ` v${
                  isSetObject(context.packageDeps[key]) &&
                  isSetString(context.packageDeps[key].version)
                    ? context.packageDeps[key].version
                    : getPackageVersion(key)
                }`
              : ""
          } (${
            (isString(context.packageDeps[key])
              ? context.packageDeps[key]
              : context.packageDeps[key]?.type) || "dependency"
          })`
      )
      .join("\n")}`
  );

  for (const [key, value] of Object.entries(context.packageDeps)) {
    const version =
      (isSetObject(value) && isValidRange(value.version) && value.version) ||
      getPackageVersion(key);

    await installPackage(
      context,
      version
        ? `${getPackageName(key)}@${String(version)}`
        : getPackageName(key),
      (isSetString(value) ? value : value.type) === "devDependency"
    );
  }
}
