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

import { Lang, parseAsync } from "@ast-grep/napi";
import { ReflectionClass, ReflectionKind } from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { Context, Options, SourceFile } from "../../types/build";
import type { LogFn } from "../../types/config";
import {
  getVarsReflectionsPath,
  resolveDotenvReflection
} from "../dotenv/resolve";

export async function transformVars<TOptions extends Options = Options>(
  log: LogFn,
  source: SourceFile,
  context: Context<TOptions>
): Promise<SourceFile> {
  const dotenvReflection = await resolveDotenvReflection(context, "variables");
  const dotenvAliasProperties = dotenvReflection
    .getProperties()
    .filter(prop => prop.getAlias().length > 0);

  const ast = await parseAsync(Lang.TypeScript, source.code.toString());
  const root = ast.root();

  const nodes = root.findAll({
    rule: {
      kind: "member_expression",
      any: [
        { pattern: "$storm.vars.$ENV_NAME" },
        { pattern: "useStorm().vars.$ENV_NAME" },
        { pattern: "process.env.$ENV_NAME" },
        { pattern: "import.meta.env.$ENV_NAME" }
      ]
    }
  });
  if (!nodes) {
    return source;
  }

  const varsReflection = ReflectionClass.from({
    kind: ReflectionKind.objectLiteral,
    description: `An object containing the configuration variables used by the ${context.options.name ? `${context.options.name} application` : "application"}.`,
    types: []
  });

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
          : dotenvAliasProperties.find(prop => prop.getAlias().includes(name));
        if (!dotenvProperty || dotenvProperty.isIgnored()) {
          continue;
        }

        if (context.dotenv.replace && !node.text().startsWith("process.env.")) {
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

        if (!varsReflection.hasProperty(name)) {
          varsReflection.addProperty(dotenvProperty.property);
        }
      } else {
        missingEnvNames.push(name);
      }
    }
  }

  if (missingEnvNames.length > 0) {
    throw new Error(
      `Environment variables are not defined in the dotenv type definition but is used in the code: \n${missingEnvNames
        .map(name => ` - ${name}`)
        .join(
          "\n"
        )} \n\nThe following variable names are defined in the dotenv type definition: \n${dotenvReflection
        .getPropertyNames()
        .map(typeDef => ` - ${String(typeDef)} `)
        .join(
          "\n"
        )} \n\nUsing the following env prefix: \n${context.dotenv.prefix.map(prefix => ` - ${prefix}`).join("\n")} \n\nPlease check your \`dotenv\` configuration option. If you are using a custom dotenv type definition, please make sure that the variable names match the ones in the code. \n\n`
    );
  }

  if (varsReflection.getProperties().length > 0) {
    log(
      LogLevelLabel.TRACE,
      `Adding environment variables from ${source.id} to vars.json.`
    );

    await context.workers.commitVars.commit({
      filePath: getVarsReflectionsPath(context, "variables"),
      vars: varsReflection.serializeType()
    });
  }

  return source;
}
