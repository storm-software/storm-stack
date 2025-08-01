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

import { ReflectionClass, resolveClassType } from "@deepkit/type";
import { reflectType } from "@storm-stack/core/lib/deepkit";
import { Context } from "@storm-stack/core/types/context";
import { joinPaths } from "@stryke/path/join-paths";
import { getDotenvDefaultTypeDefinition } from "./persistence";

export async function reflectDotenvSecrets(
  context: Context,
  file: string,
  name?: string
) {
  const secretsType = await reflectType(context, {
    file,
    name
  });

  return resolveClassType(secretsType);
}

export async function reflectDotenvConfig(
  context: Context,
  file?: string,
  name?: string
) {
  let config: ReflectionClass<any> | undefined;
  if (file) {
    const configType = await reflectType(
      context,
      {
        file: joinPaths(context.options.workspaceConfig.workspaceRoot, file),
        name
      },
      {
        skipTransforms: true
      }
    );

    config = resolveClassType(configType);
  }

  const defaultConfigType = await reflectType(
    context,
    getDotenvDefaultTypeDefinition(context),
    {
      skipTransforms: true
    }
  );

  const defaultConfig = resolveClassType(defaultConfigType);
  if (config) {
    defaultConfig.getProperties().forEach(prop => {
      if (!config!.hasProperty(prop.getName())) {
        config!.addProperty(prop.property);
      }
    });
  } else {
    config = defaultConfig;
  }

  return config;
}
