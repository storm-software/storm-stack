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
} from "../dotenv/resolve-dotenv";
import { writeDotenvProperties } from "../dotenv/write-dotenv";

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
        { pattern: "$storm.env.$ENV_VALUE" },
        { pattern: "process.env.$ENV_VALUE" },
        { pattern: "input.meta.$ENV_VALUE" }
      ]
    }
  });
  if (!nodes) {
    return source;
  }

  for (const node of nodes) {
    const name = node.getMatch("ENV_VALUE")?.text()?.replace("STORM_", "");

    if (name && varsReflection.hasProperty(name)) {
      const reflectionProperty = varsReflection.getProperty(name);

      if (context.resolvedDotenv.replace) {
        const value =
          context.resolvedDotenv.values?.[name] ??
          context.resolvedDotenv.values?.[`STORM_${name}`] ??
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
        `Environment variable \`${name}\` is not defined in the dotenv type definition but is used in the code. \n\nThe following variable names are defined in the dotenv type definition: \n${Object.keys(
          varsReflection
        )
          .map(typeDef => ` - ${typeDef} `)
          .join(
            "\n"
          )} \n\nPlease check your \`dotenv\` configuration option. If you are using a custom dotenv type definition, please make sure that the variable names match the ones in the code. \n\n`
      );
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
