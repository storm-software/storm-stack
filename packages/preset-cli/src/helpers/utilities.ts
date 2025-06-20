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

import { OrganizationConfig } from "@storm-software/config/types";
import { Context, Options } from "@storm-stack/core/types/build";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { isObject } from "@stryke/type-checks/is-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { isString } from "@stryke/type-checks/is-string";
import defu from "defu";
import { StormStackCLIPresetConfig } from "../types/config";

/**
 * Sorts command argument aliases, placing single-character aliases first, followed by multi-character aliases, and then sorting them alphabetically.
 *
 * @param aliases - An array of argument aliases to sort.
 * @returns A new array of sorted aliases.
 */
export function sortArgAliases(aliases: string[]): string[] {
  if (aliases.length === 0) {
    return [];
  }

  const result = aliases.filter(alias => alias.length === 1);
  result.push(...aliases.filter(alias => alias.length > 1));

  return result.sort((a, b) => a.localeCompare(b));
}

/**
 * Checks if the provided Node.js version is one of the valid minimum versions (16, 18, 20, 22).
 *
 * @param version - The Node.js version to check.
 * @returns An indicator of whether the version is valid.
 */
export function isValidMinNodeVersion(
  version: number
): version is 16 | 18 | 20 | 22 {
  return [16, 18, 20, 22].includes(version);
}

/**
 * Extracts the author information from the context and configuration.
 *
 * @param context - The build context containing workspace and package information.
 * @param config - The StormStackCLIPresetConfig containing author information.
 * @returns An OrganizationConfig object with the author's name.
 */
export function extractAuthor<TOptions extends Options = Options>(
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig = {}
): OrganizationConfig | undefined {
  let author: OrganizationConfig | undefined;
  if (config.author) {
    if (isString(config.author)) {
      author = { name: config.author };
    } else if (isObject(config.author)) {
      author = config.author;
    }
  }

  if (context.workspaceConfig.organization) {
    if (isString(context.workspaceConfig.organization) && !author?.name) {
      author ??= {} as OrganizationConfig;
      author.name = context.workspaceConfig.organization;
    } else {
      author = defu(author ?? {}, context.workspaceConfig.organization);
    }
  }

  if (!author?.name) {
    if (context.packageJson?.author) {
      author ??= {} as OrganizationConfig;
      author.name = isString(context.packageJson.author)
        ? context.packageJson.author
        : context.packageJson.author?.name;
    } else if (
      context.packageJson?.contributors &&
      context.packageJson.contributors.length > 0 &&
      context.packageJson.contributors[0] &&
      (isSetString(context.packageJson.contributors[0]) ||
        isSetString(context.packageJson.contributors[0].name))
    ) {
      author ??= {} as OrganizationConfig;
      author.name = (
        isString(context.packageJson.contributors[0])
          ? context.packageJson.contributors[0]
          : context.packageJson.contributors[0].name
      )!;
    }
  }

  if (author?.name) {
    author.name = kebabCase(author.name);
  }

  return author;
}
