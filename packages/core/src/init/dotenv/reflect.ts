/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
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
import { getDotenvDefaultTypeDefinition } from "../../helpers/dotenv/resolve";
import type {
  Context,
  Options,
  ResolvedDotenvType,
  ResolvedDotenvTypes
} from "../../types/build";
import type { DotenvTypeDefinitionOptions, LogFn } from "../../types/config";

async function reflectDotenvSecrets<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  file: string,
  name?: string
) {
  const secretsType = await reflectType<TOptions>(context, {
    file,
    name
  });

  return resolveClassType(secretsType);
}

async function reflectDotenvVariables<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>,
  file?: string,
  name?: string
) {
  let vars: ReflectionClass<any> | undefined;
  if (file) {
    const varsType = await reflectType<TOptions>(context, {
      file,
      name
    });

    vars = resolveClassType(varsType);
  }

  const defaultVarsType = await reflectType<TOptions>(
    context,
    getDotenvDefaultTypeDefinition(context)
  );

  const defaultVars = resolveClassType(defaultVarsType);
  if (vars) {
    defaultVars.getProperties().forEach(prop => {
      if (!vars!.hasProperty(prop.getName())) {
        vars!.addProperty(prop.property);
      }
    });
  } else {
    vars = defaultVars;
  }

  return vars;
}

export async function reflectDotenvTypes<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>
): Promise<ResolvedDotenvTypes> {
  const result = {} as ResolvedDotenvTypes;

  let params = {
    variables: `${getDotenvDefaultTypeDefinition(context).file}#${getDotenvDefaultTypeDefinition(context).name}`
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
          variables: `${context.options.dotenv.types}#Variables`,
          secrets: `${context.options.dotenv.types}#Secrets`
        };
  }

  result.variables ??= {} as ResolvedDotenvType<ReflectionClass<any>>;
  if (params.variables) {
    result.variables.typeDefinition = parseTypeDefinition(
      params.variables
    ) as TypeDefinition;

    if (
      result.variables.typeDefinition?.file &&
      existsSync(
        joinPaths(
          context.options.projectRoot,
          result.variables.typeDefinition.file
        )
      )
    ) {
      result.variables.reflection = await reflectDotenvVariables(
        log,
        context,
        joinPaths(
          context.options.projectRoot,
          result.variables.typeDefinition.file
        ),
        result.variables.typeDefinition.name
      );
    } else {
      log(
        LogLevelLabel.WARN,
        "Cannot find the `dotenv.types.variables` type definition in the provided configuration."
      );

      result.variables.reflection = await reflectDotenvVariables(log, context);
    }
  } else {
    log(
      LogLevelLabel.WARN,
      "The `dotenv.types.variables` configuration parameter was not provided. Please ensure this is expected."
    );

    result.variables.reflection = await reflectDotenvVariables(log, context);
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

  const varsReflection = ReflectionClass.from(result.variables.reflection);
  let secretsReflection: ReflectionClass<any> | undefined;
  if (result.secrets) {
    secretsReflection = ReflectionClass.from(result.secrets.reflection);
  }

  log(
    LogLevelLabel.TRACE,
    `Resolved ${varsReflection.getProperties().length ?? 0} variable and ${secretsReflection?.getProperties().length ?? 0} secret dotenv definitions`
  );

  return result;
}
