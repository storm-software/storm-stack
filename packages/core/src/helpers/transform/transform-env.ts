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
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { Mutex } from "@stryke/helpers/mutex";
import type { Context, Options, SourceFile } from "../../types/build";
import type { LogFn } from "../../types/config";
import {
  resolveDotenvProperties,
  resolveDotenvReflection
} from "../dotenv/resolve";
import { writeDotenvProperties } from "../dotenv/write-reflections";

const mutex = new Mutex();

export async function transformEnv<TOptions extends Options = Options>(
  log: LogFn,
  source: SourceFile,
  context: Context<TOptions>
): Promise<SourceFile> {
  const varsReflection = await resolveDotenvReflection(context, "variables");

  const dotenvProperties = await resolveDotenvProperties(
    log,
    context,
    "variables"
  );
  const originalLength = dotenvProperties.length;

  const ast = await parseAsync(Lang.TypeScript, source.code.toString());
  const root = ast.root();

  const nodes = root.findAll({
    rule: {
      kind: "member_expression",
      any: [
        { pattern: "$storm.vars.$ENV_NAME" },
        { pattern: "useStorm().vars.$ENV_NAME" },
        { pattern: "process.env.$ENV_NAME" }
      ]
    }
  });
  if (!nodes) {
    return source;
  }

  for (const node of nodes) {
    const envName = node.getMatch("ENV_NAME")?.text();
    if (envName) {
      const prefix = context.dotenv.prefix.find(pre =>
        varsReflection.hasProperty(envName.replace(`${pre}_`, ""))
      );
      if (
        prefix &&
        varsReflection.hasProperty(envName.replace(`${prefix}_`, ""))
      ) {
        const name = envName.replace(`${prefix}_`, "");
        const reflectionProperty = varsReflection.getProperty(name);

        if (context.dotenv.replace && !node.text().startsWith("process.env.")) {
          const value =
            context.dotenv.values?.[name] ??
            Object.keys(context.dotenv.values ?? {}).find(key =>
              context.dotenv.prefix.find(pre => key === `${pre}_${name}`)
            ) ??
            reflectionProperty.getDefaultValue();
          if (reflectionProperty.isValueRequired() && value === undefined) {
            throw new Error(
              `Environment variable \`${name}\` is not defined in the .env configuration files`
            );
          }

          source.code = source.code.replaceAll(node.text(), String(value));
        }

        dotenvProperties.push(reflectionProperty);
      } else {
        throw new Error(
          `Environment variable \`${envName}\` is not defined in the dotenv type definition but is used in the code. \n\nThe following variable names are defined in the dotenv type definition: \n${varsReflection
            .getPropertyNames()
            .map(typeDef => ` - ${String(typeDef)} `)
            .join(
              "\n"
            )} \n\nUsing the following env prefix: \n${context.dotenv.prefix.map(prefix => ` - ${prefix}`).join("\n")} \n\nPlease check your \`dotenv\` configuration option. If you are using a custom dotenv type definition, please make sure that the variable names match the ones in the code. \n\n`
        );
      }
    }
  }

  if (dotenvProperties.length !== originalLength) {
    log(
      LogLevelLabel.INFO,
      `Adding environment variables from ${source.id} to variables.json.`
    );

    await mutex.acquire();
    try {
      await writeDotenvProperties(log, context, "variables", dotenvProperties);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      mutex.release();
    }
  }

  return source;
}
