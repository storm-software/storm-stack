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
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { readJsonFile } from "@stryke/fs/read-file";
import { deepClone } from "@stryke/helpers/deep-clone";
import { isEqual } from "@stryke/helpers/is-equal";
import { Mutex } from "@stryke/helpers/mutex";
import { StormJSON } from "@stryke/json/storm-json";
import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import defu from "defu";
import type {
  Context,
  Options,
  ResolvedDotenvTypeDefinitionProperty,
  SourceFile
} from "../../types/build";
import type { LogFn } from "../../types/config";
import { writeFile } from "../utilities/write-file";

const mutex = new Mutex();

export async function transformEnv<TOptions extends Options = Options>(
  log: LogFn,
  source: SourceFile,
  context: Context<TOptions>
): Promise<SourceFile> {
  const typeDefs = context.resolvedDotenv?.types?.variables?.properties;
  if (!typeDefs) {
    throw new Error(
      "No type definitions found for environment variables. Please check your dotenv configuration."
    );
  }

  let vars = {} as Record<string, ResolvedDotenvTypeDefinitionProperty>;
  if (
    existsSync(
      joinPaths(context.projectRoot, context.artifactsDir, "vars.json")
    )
  ) {
    vars = await readJsonFile(
      joinPaths(context.projectRoot, context.artifactsDir, "vars.json")
    );
  }

  const originalVars = deepClone(vars);

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
    if (name && typeDefs[name]) {
      const typeDef = typeDefs[name];
      if (context.resolvedDotenv.replace) {
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

      vars[name] ??= typeDef;
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
  }

  if (!isEqual(originalVars, vars)) {
    log(
      LogLevelLabel.INFO,
      `Adding enviroment variables from ${source.id} to vars.json.`
    );

    await mutex.acquire();
    try {
      await writeFile(
        log,
        joinPaths(context.projectRoot, context.artifactsDir, "vars.json"),
        StormJSON.stringify(
          defu(
            vars,
            existsSync(
              joinPaths(context.projectRoot, context.artifactsDir, "vars.json")
            )
              ? await readJsonFile(
                  joinPaths(
                    context.projectRoot,
                    context.artifactsDir,
                    "vars.json"
                  )
                )
              : {}
          )
        )
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      mutex.release();
    }
  }

  return source;
}
