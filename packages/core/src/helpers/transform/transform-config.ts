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

import { Lang, parseAsync } from "@ast-grep/napi";
import { ReflectionClass, ReflectionKind } from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { Context, SourceFile } from "../../types/build";
import type { LogFn } from "../../types/config";
import {
  getConfigReflectionsPath,
  readDotenvReflection
} from "../dotenv/persistence";

export async function transformConfig(
  log: LogFn,
  source: SourceFile,
  context: Context
): Promise<SourceFile> {
  const dotenvReflection = await readDotenvReflection(context, "config");
  const dotenvAliasProperties = dotenvReflection
    .getProperties()
    .filter(prop => prop.getAlias().length > 0);

  const ast = await parseAsync(Lang.TypeScript, source.code.toString());
  const root = ast.root();

  const nodes = root.findAll({
    rule: {
      kind: "member_expression",
      any: [
        { pattern: "$storm.config.$ENV_NAME" },
        { pattern: "useStorm().config.$ENV_NAME" },
        { pattern: "process.env.$ENV_NAME" },
        { pattern: "import.meta.env.$ENV_NAME" }
      ]
    }
  });
  if (!nodes) {
    return source;
  }

  const configReflection = ReflectionClass.from({
    kind: ReflectionKind.objectLiteral,
    description: `An object containing the configuration parameters used by the ${context.options.name ? `${context.options.name} application` : "application"}.`,
    types: []
  });

  try {
    const missingEnvNames = [] as string[];
    for (const node of nodes) {
      const envName = node.getMatch("ENV_NAME")?.text();
      if (envName) {
        const prefix = context.dotenv.prefix.find(
          pre =>
            envName &&
            envName.startsWith(pre) &&
            (dotenvReflection.hasProperty(envName.replace(`${pre}_`, "")) ||
              dotenvAliasProperties.some(prop =>
                prop.getAlias().includes(envName.replace(`${pre}_`, ""))
              ))
        );

        let name = envName;
        if (prefix) {
          name = envName.replace(`${prefix}_`, "");
        }

        if (
          dotenvReflection.hasProperty(name) ||
          dotenvAliasProperties.some(prop => prop.getAlias().includes(name))
        ) {
          const dotenvProperty = dotenvReflection.hasProperty(name)
            ? dotenvReflection.getProperty(name)
            : dotenvAliasProperties.find(prop =>
                prop.getAlias().includes(name)
              );
          if (!dotenvProperty || dotenvProperty.isIgnored()) {
            continue;
          }

          if (
            context.dotenv.replace &&
            !node.text().startsWith("process.env.")
          ) {
            const value =
              context.dotenv.values?.[name] ??
              context.dotenv.prefix.reduce((ret, pre) => {
                if (context.dotenv.values[`${pre}_${name}`]) {
                  ret = context.dotenv.values[`${pre}_${name}`];
                }

                return ret;
              }, undefined as any) ??
              dotenvProperty.getDefaultValue();
            if (dotenvProperty.isValueRequired() && value === undefined) {
              throw new Error(
                `Environment variable \`${name}\` is not defined in the .env configuration files`
              );
            }

            source.code = source.code.replaceAll(node.text(), String(value));
          }

          if (!configReflection.hasProperty(name)) {
            configReflection.addProperty(dotenvProperty.property);
          }
        } else if (!missingEnvNames.includes(name)) {
          missingEnvNames.push(name);
        }
      }
    }

    if (missingEnvNames.length > 0) {
      throw new Error(
        `The following environment variables are not defined in the dotenv type definition but is used in the code: \n${missingEnvNames
          .map(name => ` - ${name}`)
          .join(
            "\n"
          )} \n\nThe following variable names are defined in the dotenv type definition: \n${dotenvReflection
          .getPropertyNames()
          .map(
            typeDef =>
              ` - ${String(typeDef)} ${
                dotenvAliasProperties.some(
                  prop =>
                    prop.getNameAsString() === String(typeDef) &&
                    prop.getAlias().length > 0
                )
                  ? `(Alias: ${dotenvAliasProperties
                      ?.find(prop => prop.getNameAsString() === String(typeDef))
                      ?.getAlias()
                      .join(", ")})`
                  : ""
              }`
          )
          .join(
            "\n"
          )} \n\nUsing the following env prefix: \n${context.dotenv.prefix.map(prefix => ` - ${prefix}`).join("\n")} \n\nPlease check your \`dotenv\` configuration option. If you are using a custom dotenv type definition, please make sure that the configuration names match the ones in the code. \n\n`
      );
    }

    if (configReflection.getProperties().length > 0) {
      log(
        LogLevelLabel.TRACE,
        `Adding environment variables from ${source.id} to config.json.`
      );

      await context.workers.configReflection.add({
        path: getConfigReflectionsPath(context, "config"),
        config: configReflection.serializeType()
      });
    }

    return source;
  } catch (error) {
    log(
      LogLevelLabel.ERROR,
      `Failed to transform the configuration in ${source.id}: ${
        (error as Error)?.message ? error.message : JSON.stringify(error)
      } ${(error as Error)?.stack ? `\n\n${error.stack}` : ""}`
    );
    throw error;
  }
}
