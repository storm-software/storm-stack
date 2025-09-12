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
import { reflectType } from "@storm-stack/core/lib/deepkit/reflect-type";
import {
  StormEnvInterface,
  StormSecretsInterface
} from "@storm-stack/core/runtime-types/shared/env";
import { joinPaths } from "@stryke/path/join-paths";
import { titleCase } from "@stryke/string-format/title-case";
import { EnvPluginContext } from "../types/plugin";
import {
  getEnvDefaultTypeDefinition,
  getSecretsDefaultTypeDefinition,
  readEnvTypeReflection,
  readSecretsReflection
} from "./persistence";

export function mergeEnvReflections(
  context: EnvPluginContext,
  reflections: ReflectionClass<any>[]
): ReflectionClass<any> {
  const reflection = createEnvReflection(context, {
    type: merge(reflections.map(reflection => reflection.type))
  });

  return reflection;
}

export function mergeSecretsReflections(
  context: EnvPluginContext,
  reflections: ReflectionClass<any>[]
): ReflectionClass<any> {
  const reflection = createSecretsReflection(context, {
    type: merge(reflections.map(reflection => reflection.type))
  });

  return reflection;
}

export interface CreateEnvReflectionOptions {
  type?: TypeObjectLiteral | TypeClass;
  superReflection?: ReflectionClass<any>;
}

export class StormBaseEnv implements StormEnvInterface {
  STORM_STACK_LOCAL: boolean;

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

export class StormBaseSecrets implements StormSecretsInterface {
  ENCRYPTION_KEY: string;
}

export function createEnvReflection(
  context: EnvPluginContext,
  options: CreateEnvReflectionOptions = {}
): ReflectionClass<any> {
  const parent =
    options.superReflection ??
    new ReflectionClass({
      kind: ReflectionKind.class,
      description: `The base environment configuration definition for the ${titleCase(
        context.options.name
      )} project.`,
      classType: StormBaseEnv,
      types: [],
      implements: [
        {
          kind: ReflectionKind.objectLiteral,
          typeName: "StormEnvInterface",
          description: `The environment configuration interface definition for the ${titleCase(
            context.options.name
          )} project.`,
          types: []
        }
      ]
    });
  parent.name = "StormEnv";

  const result = new ReflectionClass(
    options.type ?? {
      kind: ReflectionKind.objectLiteral,
      typeName: "StormEnv",
      description: `A schema describing the list of available environment variables that can be used by the ${
        context.options.name
          ? `${titleCase(context.options.name)} application`
          : "application"
      }.`,
      types: []
    },
    parent
  );
  result.name = "StormEnv";

  return result;
}

export function createSecretsReflection(
  context: EnvPluginContext,
  options: CreateEnvReflectionOptions = {}
): ReflectionClass<any> {
  const parent =
    options.superReflection ??
    new ReflectionClass({
      kind: ReflectionKind.class,
      description: `The base secrets configuration definition for the ${titleCase(
        context.options.name
      )} project.`,
      classType: StormBaseSecrets,
      types: [],
      implements: [
        {
          kind: ReflectionKind.objectLiteral,
          typeName: "StormSecretsInterface",
          description: `The secrets configuration interface definition for the ${titleCase(
            context.options.name
          )} project.`,
          types: []
        }
      ]
    });
  parent.name = "StormSecrets";

  const result = new ReflectionClass(
    options.type ?? {
      kind: ReflectionKind.objectLiteral,
      typeName: "StormSecrets",
      description: `A schema describing the list of available environment secrets that can be used by the ${
        context.options.name
          ? `${titleCase(context.options.name)} application`
          : "application"
      }.`,
      types: []
    },
    parent
  );
  result.name = "StormSecrets";

  return result;
}

export async function reflectEnv(
  context: EnvPluginContext,
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
    getEnvDefaultTypeDefinition(context),
    {
      compiler: {
        reflectionLevel: "verbose",
        skipAllTransforms: true
      }
    }
  );

  const reflection = await readEnvTypeReflection(context, "env");

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

  return mergeEnvReflections(
    context,
    [reflection, config, resolveClassType(defaultConfigType)].filter(
      Boolean
    ) as ReflectionClass<any>[]
  );
}

export async function reflectSecrets(
  context: EnvPluginContext,
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

  const defaultSecretsType = await reflectType(
    context,
    getSecretsDefaultTypeDefinition(context),
    {
      compiler: {
        reflectionLevel: "verbose",
        skipAllTransforms: true
      }
    }
  );

  const reflection = await readSecretsReflection(context);

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

  return mergeSecretsReflections(
    context,
    [reflection, config, resolveClassType(defaultSecretsType)].filter(
      Boolean
    ) as ReflectionClass<any>[]
  );
}
