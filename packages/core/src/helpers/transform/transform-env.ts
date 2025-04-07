/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import { Lang, parseAsync } from "@ast-grep/napi";
import type { Context, Options, SourceFile } from "../../types/build";

export async function transformEnv<TOptions extends Options = Options>(
  source: SourceFile,
  context: Context<TOptions>
): Promise<SourceFile> {
  const typeDefs = context.resolvedDotenv?.types?.variables?.properties;
  if (!typeDefs) {
    throw new Error(
      "No type definitions found for environment variables. Please check your dotenv configuration."
    );
  }

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

  nodes.forEach(node => {
    const name = node.getMatch("ENV_VALUE")?.text()?.replace("STORM_", "");
    if (name && typeDefs[name]) {
      if (context.resolvedDotenv.replace) {
        const typeDef = typeDefs[name];
        const value =
          context.resolvedDotenv.values?.[name] ??
          context.resolvedDotenv.values?.[`STORM_${name}`] ??
          typeDef.defaultValue;
        if (!typeDef.isOptional && value === undefined) {
          throw new Error(
            `Environment variable \`${name}\` is not defined in the .env configuration files`
          );
        }

        source.code = source.code.replaceAll(
          node.text(),
          typeDef?.text === "string" ||
            typeDef?.text?.includes('"') ||
            typeDef?.type?.isString ||
            typeDef?.type?.isStringLiteral
            ? `"${value}"`
            : `${value}`
        );
      }
      if (!source.env.includes(name)) {
        source.env.push(name);
      }
    } else {
      throw new Error(
        `Environment variable \`${name}\` is not defined in the dotenv type definition but is used in the code. \n\nThe following variable names are defined in the dotenv type definition: \n${Object.keys(
          typeDefs
        )
          .map(typeDef => ` - ${typeDef} `)
          .join(
            "\n"
          )} \n\nPlease check your \`dotenv\` configuration option. If you are using a custom dotenv type definition, please make sure that the variable names match the ones in the code. \n\n`
      );
    }
  });

  return source;
}
