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

import { ReflectionClass, stringifyType } from "@deepkit/type";
import { stringifyValue } from "@storm-stack/core/lib/deepkit/utilities";
import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import type { Context } from "@storm-stack/core/types/context";
import { titleCase } from "@stryke/string-format/title-case";
import { readConfigReflection } from "../helpers/persistence";

/**
 * Generates the Storm Stack configuration file.
 *
 * @param context - The build context containing runtime information.
 * @returns A string representing the configuration file content.
 */
export async function ConfigModule(context: Context) {
  return `${getFileHeader()}

import { StormBaseConfig } from "@storm-stack/types/shared/config";

/**
 * A type definition representing the Storm Stack configuration.
 *
 * @remarks
 * This interface extends the base configuration interface and includes additional properties specific to the Storm Stack application being built.
 */
export interface StormConfig extends StormBaseConfig ${await generateConfigInterface(
    context
  )}

/**
 * A global configuration object containing the Storm Stack configuration.
 */
export const config = ${await generateConfig(context)} as StormConfig;

`;
}

async function generateConfig(context: Context) {
  const reflection = await readConfigReflection(context);
  if (!reflection) {
    return "{}";
  }

  return `{
  ${innerGenerateConfig(reflection)}
}`;
}

function innerGenerateConfig(reflection: ReflectionClass<any>) {
  if (!reflection) {
    return "";
  }

  return `
${reflection
  .getProperties()
  .filter(item => !item.isHidden() && !item.isIgnored() && item.hasDefault())
  .sort((a, b) =>
    (a.isReadonly() && b.isReadonly()) || (!a.isReadonly() && !b.isReadonly())
      ? a.getNameAsString().localeCompare(b.getNameAsString())
      : a.isReadonly()
        ? -1
        : 1
  )
  .map(
    item =>
      `/**
     * ${
       item.getDescription() ||
       item.getTitle() ||
       titleCase(item.getNameAsString())
     }
     *
     * @title ${item.getTitle() || titleCase(item.getNameAsString())}${
       item.getAlias().length
         ? `
${item
  .getAlias()
  .map(alias => ` * @alias ${alias}`)
  .join("\n")}`
         : ""
     }${
       item.getDomain()
         ? `
 * @domain ${item.getDomain()}`
         : ""
     }${
       item.getPermission().length
         ? `
${item
  .getPermission()
  .map(permission => ` * @permission ${permission}`)
  .join("\n")}`
         : ""
     }${
       typeof item.getDefaultValue() !== "undefined" &&
       item.getDefaultValue() !== ""
         ? `
 * @defaultValue ${item.getDefaultValue()}`
         : ""
     }${
       item.isInternal()
         ? `
 * @internal`
         : ""
     }${
       item.isReadonly()
         ? `
 * @readonly`
         : ""
     }${
       item.isHidden()
         ? `
 * @hidden`
         : ""
     }
     */
    ${item.getNameAsString()}: ${stringifyValue(item)},
`
  )
  .join("\n")}`;
}

export async function generateConfigInterface(context: Context) {
  const reflection = await readConfigReflection(context);
  if (!reflection) {
    return "{}";
  }

  return `{
  ${innerGenerateConfigInterface(reflection)}

  [key: string]: any;
}`;
}

export function innerGenerateConfigInterface(reflection: ReflectionClass<any>) {
  if (!reflection) {
    return "";
  }

  return `
${reflection
  .getProperties()
  .filter(item => !item.isHidden() || !item.isIgnored())
  .sort((a, b) =>
    (a.isReadonly() && b.isReadonly()) || (!a.isReadonly() && !b.isReadonly())
      ? a.getNameAsString().localeCompare(b.getNameAsString())
      : a.isReadonly()
        ? -1
        : 1
  )
  .map(
    item =>
      `/**
     * ${item.getDescription() || item.getTitle() || titleCase(item.getNameAsString())}
     *
     * @title ${item.getTitle() || titleCase(item.getNameAsString())}${
       item.getAlias().length
         ? `
${item
  .getAlias()
  .map(alias => ` * @alias ${alias}`)
  .join("\n")}`
         : ""
     }${
       item.getDomain()
         ? `
 * @domain ${item.getDomain()}`
         : ""
     }${
       item.getPermission().length
         ? `
${item
  .getPermission()
  .map(permission => ` * @permission ${permission}`)
  .join("\n")}`
         : ""
     }${
       typeof item.getDefaultValue() !== "undefined" &&
       item.getDefaultValue() !== ""
         ? `
 * @defaultValue ${item.getDefaultValue()}`
         : ""
     }${
       item.isInternal()
         ? `
 * @internal`
         : ""
     }${
       item.isReadonly()
         ? `
 * @readonly`
         : ""
     }${
       item.isHidden()
         ? `
 * @hidden`
         : ""
     }
     */
    ${item.getNameAsString()}${
      item.isActualOptional() ? "?" : ""
    }: ${stringifyType(item.getType())}
`
  )
  .join("\n")}`;
}
