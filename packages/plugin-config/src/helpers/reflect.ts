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

import {
  merge,
  ReflectionClass,
  ReflectionKind,
  resolveClassType,
  TypeClass,
  TypeObjectLiteral
} from "@storm-stack/core/deepkit/type";
import { reflectType } from "@storm-stack/core/lib/deepkit";
import { StormConfigInterface } from "@storm-stack/core/runtime-types/shared/config";
import { joinPaths } from "@stryke/path/join-paths";
import { titleCase } from "@stryke/string-format/title-case";
import { ConfigPluginContext } from "../types";
import {
  getConfigDefaultTypeDefinition,
  readConfigTypeReflection
} from "./persistence";

export function mergeConfigReflections(
  context: ConfigPluginContext,
  reflections: ReflectionClass<any>[]
): ReflectionClass<any> {
  const reflection = createConfigParamsReflection(context, {
    type: merge(reflections.map(reflection => reflection.type))
  });

  return reflection;
}

export function createConfigSecretsReflection(context: ConfigPluginContext) {
  return ReflectionClass.from({
    kind: ReflectionKind.objectLiteral,
    typeName: "StormSecrets",
    description: `An object containing the secret parameters that are used (at least once) by the ${
      context.options.name
        ? `${titleCase(context.options.name)} application`
        : "application"
    }.`,
    types: []
  });
}

export async function reflectConfigSecrets(
  context: ConfigPluginContext,
  file: string,
  name?: string
) {
  const secretsType = await reflectType(
    context,
    {
      file,
      name
    },
    {
      skipNodeModulesBundle: true,
      compiler: {
        reflectionLevel: "verbose",
        skipAllTransforms: true
      }
    }
  );

  return resolveClassType(secretsType);
}

export interface CreateConfigParamsReflectionOptions {
  type?: TypeObjectLiteral | TypeClass;
  superReflection?: ReflectionClass<any>;
}

export class StormBaseConfig implements StormConfigInterface {
  static: any;

  APP_NAME: string;

  APP_VERSION: string;

  BUILD_ID: string;

  BUILD_TIMESTAMP: string;

  BUILD_CHECKSUM: string;

  RELEASE_ID: string;

  RELEASE_TAG: string;

  ORGANIZATION: string;

  PLATFORM: "node" | "browser" | "neutral";

  MODE: "development" | "staging" | "production";

  ENVIRONMENT: string;

  DEBUG: boolean;

  TEST: boolean;

  MINIMAL: boolean;

  NO_COLOR: boolean;

  FORCE_COLOR: number | boolean;

  FORCE_HYPERLINK: number | boolean;

  STACKTRACE: boolean;

  INCLUDE_ERROR_DATA: boolean;

  ERROR_URL: string;

  DEFAULT_TIMEZONE: string;

  DEFAULT_LOCALE: string;

  CI: boolean;
}

export function createConfigParamsReflection(
  context: ConfigPluginContext,
  options: CreateConfigParamsReflectionOptions = {}
): ReflectionClass<any> {
  const parent =
    options.superReflection ??
    new ReflectionClass({
      kind: ReflectionKind.class,
      description: `The base configuration definition for the ${titleCase(
        context.options.name
      )} project.`,
      classType: StormBaseConfig,
      types: [],
      implements: [
        {
          kind: ReflectionKind.objectLiteral,
          typeName: "StormConfigInterface",
          description: `The configuration interface definition for the ${titleCase(
            context.options.name
          )} project.`,
          types: []
        }
      ]
    });
  parent.name = "StormConfig";

  const result = new ReflectionClass(
    options.type ?? {
      kind: ReflectionKind.objectLiteral,
      typeName: "StormConfig",
      description: `A schema describing the list of available configuration parameters that can be used by the ${
        context.options.name
          ? `${titleCase(context.options.name)} application`
          : "application"
      }.`,
      types: []
    },
    parent
  );
  result.name = "StormConfig";

  return result;
}

export async function reflectConfigParams(
  context: ConfigPluginContext,
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
        skipNodeModulesBundle: true,
        compiler: {
          reflectionLevel: "verbose",
          skipAllTransforms: true
        }
      }
    );

    config = resolveClassType(configType);
  }

  const defaultConfigType = await reflectType(
    context,
    getConfigDefaultTypeDefinition(context),
    {
      compiler: {
        reflectionLevel: "verbose",
        skipAllTransforms: true
      }
    }
  );

  const reflection = await readConfigTypeReflection(context, "params");

  // const defaultConfig = resolveClassType(defaultConfigType);
  // if (config) {
  //   defaultConfig.getProperties().forEach(prop => {
  //     if (!config!.hasProperty(prop.getName())) {
  //       config!.addProperty(prop.property);
  //     }
  //   });
  // } else {
  //   config = defaultConfig;
  // }

  return mergeConfigReflections(
    context,
    [reflection, config, resolveClassType(defaultConfigType)].filter(
      Boolean
    ) as ReflectionClass<any>[]
  );
}
