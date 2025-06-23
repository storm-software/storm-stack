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

import { ReflectionClass, resolveClassType } from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { parseTypeDefinition } from "@stryke/convert/parse-type-definition";
import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import { isObject } from "@stryke/type-checks/is-object";
import type { TypeDefinition } from "@stryke/types/configuration";
import { reflectType } from "../../helpers/deepkit";
import { getDotenvDefaultTypeDefinition } from "../../helpers/dotenv/persistence";
import type {
  Context,
  ResolvedDotenvType,
  ResolvedDotenvTypes
} from "../../types/build";
import type { DotenvTypeDefinitionOptions, LogFn } from "../../types/config";

async function reflectDotenvSecrets(
  log: LogFn,
  context: Context,
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
      skipDotenvTransform: true
    }
  );

  return resolveClassType(secretsType);
}

async function reflectDotenvVariables(
  log: LogFn,
  context: Context,
  file?: string,
  name?: string
) {
  let config: ReflectionClass<any> | undefined;
  if (file) {
    const configType = await reflectType(
      context,
      {
        file: joinPaths(context.workspaceConfig.workspaceRoot, file),
        name
      },
      {
        skipDotenvTransform: true
      }
    );

    config = resolveClassType(configType);
  }

  const defaultConfigType = await reflectType(
    context,
    getDotenvDefaultTypeDefinition(context),
    {
      skipDotenvTransform: true
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

export async function reflectDotenvTypes(
  log: LogFn,
  context: Context
): Promise<ResolvedDotenvTypes> {
  const result = {} as ResolvedDotenvTypes;

  let params = {
    config: `${getDotenvDefaultTypeDefinition(context).file}#${getDotenvDefaultTypeDefinition(context).name}`
  } as DotenvTypeDefinitionOptions;
  if (!context.options.dotenv?.types) {
    log(
      LogLevelLabel.WARN,
      "No environment variable type definitions were provided in the `dotenv.types` configuration."
    );
  } else {
    params = isObject(context.options.dotenv.types)
      ? context.options.dotenv.types
      : {
          config: `${context.options.dotenv.types}#Config`,
          secrets: `${context.options.dotenv.types}#Secrets`
        };
  }

  result.config ??= {} as ResolvedDotenvType<ReflectionClass<any>>;
  if (params.config) {
    result.config.typeDefinition = parseTypeDefinition(
      params.config
    ) as TypeDefinition;

    if (
      result.config.typeDefinition?.file &&
      existsSync(
        joinPaths(
          context.options.projectRoot,
          result.config.typeDefinition.file
        )
      )
    ) {
      result.config.reflection = await reflectDotenvVariables(
        log,
        context,
        joinPaths(
          context.options.projectRoot,
          result.config.typeDefinition.file
        ),
        result.config.typeDefinition.name
      );
    } else {
      log(
        LogLevelLabel.WARN,
        "Cannot find the `dotenv.types.config` type definition in the provided configuration."
      );

      result.config.reflection = await reflectDotenvVariables(log, context);
    }
  } else {
    log(
      LogLevelLabel.WARN,
      "The `dotenv.types.config` configuration parameter was not provided. Please ensure this is expected."
    );

    result.config.reflection = await reflectDotenvVariables(log, context);
  }

  if (params.secrets) {
    result.secrets ??= {} as ResolvedDotenvType<
      ReflectionClass<any> | undefined
    >;
    result.secrets.typeDefinition = parseTypeDefinition(
      params.secrets
    ) as TypeDefinition;
    if (!result.secrets.typeDefinition?.file) {
      throw new Error(
        "Invalid type definition for secrets found in `dotenv.types.secrets` of the provided configuration."
      );
    }

    if (
      existsSync(
        joinPaths(
          context.options.projectRoot,
          result.secrets.typeDefinition.file
        )
      )
    ) {
      result.secrets.reflection = await reflectDotenvSecrets(
        log,
        context,
        joinPaths(
          context.options.projectRoot,
          result.secrets.typeDefinition.file
        ),
        result.secrets.typeDefinition.name
      );
    } else {
      log(
        LogLevelLabel.WARN,
        "Cannot find the `dotenv.types.secrets` type definition in the provided configuration."
      );
    }
  } else {
    log(
      LogLevelLabel.WARN,
      "The `dotenv.types.secrets` configuration parameter was not provided. Please ensure this is expected."
    );
  }

  const configReflection = ReflectionClass.from(result.config.reflection);
  let secretsReflection: ReflectionClass<any> | undefined;
  if (result.secrets) {
    secretsReflection = ReflectionClass.from(result.secrets.reflection);
  }

  log(
    LogLevelLabel.TRACE,
    `Resolved ${configReflection.getProperties().length ?? 0} configuration parameters and ${secretsReflection?.getProperties().length ?? 0} secret dotenv definitions`
  );

  return result;
}
