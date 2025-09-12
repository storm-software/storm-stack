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

import { ReflectionClass } from "@storm-stack/core/deepkit/type";
import { titleCase } from "@stryke/string-format/title-case";
import { EnvPluginContext, EnvType } from "../types/plugin";
import { readEnvTypeReflection } from "./persistence";

/**
 * Creates the reflection data used when generating runtime template files.
 *
 * @param context - The context for the configuration plugin.
 * @param name - The name of the configuration template.
 * @returns The reflection for the specified configuration template.
 */
export async function createTemplateReflection(
  context: EnvPluginContext,
  name?: EnvType
): Promise<ReflectionClass<any>> {
  const reflection = await readEnvTypeReflection(context, name);

  reflection.getProperties().forEach(prop => {
    const aliases = prop.getAlias();
    aliases.filter(Boolean).forEach(alias => {
      reflection.addProperty({
        name: alias,
        optional: prop.isOptional() ? true : undefined,
        readonly: prop.isReadonly() ? true : undefined,
        description: prop.getDescription(),
        visibility: prop.getVisibility(),
        type: prop.getType(),
        default: prop.getDefaultValue(),
        tags: {
          hidden: prop.isHidden(),
          ignore: prop.isIgnored(),
          internal: prop.isInternal(),
          alias: prop
            .getAlias()
            .filter(a => a !== alias)
            .concat(prop.name),
          title: prop.getTitle() || titleCase(prop.name),
          readonly: prop.isReadonly(),
          permission: prop.getPermission(),
          domain: prop.getDomain()
        }
      });
    });
  });

  return reflection;
}
