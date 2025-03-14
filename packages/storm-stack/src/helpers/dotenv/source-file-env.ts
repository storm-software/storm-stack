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

import type { DotenvParseOutput } from "@stryke/env/types";
import { ENV_PREFIXES } from "@stryke/env/types";
import { camelCase } from "@stryke/string-format/camel-case";
import { isEmpty } from "@stryke/type-checks/is-empty";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { isString } from "@stryke/type-checks/is-string";
import type { Project } from "ts-morph";
import { SyntaxKind } from "ts-morph";
import type {
  ResolvedDotenvOptions,
  SourceFileEnv
} from "../../types/build";

type TReturned<TEnv> = TEnv extends string ? string : DotenvParseOutput;
export const removeEnvPrefix = <TEnv extends DotenvParseOutput | string>(
  env: TEnv
): TReturned<TEnv> => {
  if (isString(env)) {
    let name: string = ENV_PREFIXES.reduce((ret, prefix) => {
      if (ret.startsWith(prefix)) {
        ret = ret.slice(prefix.length);
      }

      return ret;
    }, env.toUpperCase());

    while (name.startsWith("_")) {
      name = name.slice(1);
    }

    return name as TReturned<TEnv>;
  }

  return Object.keys(env).reduce((ret, key) => {
    const name = removeEnvPrefix(key);
    if (name) {
      ret[name] = env[key];
    }

    return ret;
  }, {} as TReturned<TEnv>);
};

export const formatEnvField = (key: string): string => {
  return camelCase(removeEnvPrefix(key))!;
};

export const getSourceFileEnv = async (
  id: string,
  dotenv: ResolvedDotenvOptions,
  project: Project
): Promise<Record<string, SourceFileEnv>> => {
  const result = {} as Record<string, SourceFileEnv>;

  const sourceFile = project.getSourceFile(id);
  if (sourceFile) {
    for (const node of sourceFile.getDescendantsOfKind(
      SyntaxKind.PropertyAccessExpression
    )) {
      const text = node.getText({
        trimLeadingIndentation: false,
        includeJsDocComments: false
      });
      if (
        text.startsWith("$storm.env.") ||
        text.startsWith("process.env.") ||
        text.startsWith("import.meta.env.")
      ) {
        const name = text.replace(/(?:\$storm|process|import)\.env\./, "");
        if (isSetString(name)) {
          const formattedName = removeEnvPrefix(name);
          if (isSetString(formattedName)) {
            if (
              !isSetObject(dotenv.types?.variables?.properties) ||
              !dotenv.types.variables.properties[formattedName]
            ) {
              throw new Error(
                `The environment variable \`${name}\` was not found in the \`dotenv.types.variables\` type, but is used in "${id}". Please add it to the type definition${dotenv?.types?.variables?.file ? ` \`${dotenv.types.variables.name || "Variables"}\` in "${dotenv.types.variables.file}"` : ""}.`
              );
            }

            const type = dotenv.types.variables.properties[formattedName];
            const defaultValue = type.jsDocs?.reduce(
              (ret, jsDoc) => {
                const tag = jsDoc
                  .getTags()
                  .find(
                    tag =>
                      tag.getTagName() === "default" ||
                      tag.getTagName() === "defaultValue"
                  );
                if (tag) {
                  return tag
                    .getText()
                    .replace("@defaultValue", "")
                    .replace("@default", "")
                    .trim();
                }

                return ret;
              },
              undefined as string | undefined
            );

            const match = Object.keys(dotenv.types.variables.properties).find(
              key => key.toLowerCase() === formattedName.toLowerCase()
            );
            if (
              !match ||
              (isEmpty(dotenv.values[match]) &&
                !type.isOptional &&
                !type.type?.isUndefined() &&
                !type.type?.isNull() &&
                !type.type?.isNullable())
            ) {
              throw new Error(
                `Configuration parameter "${name}" was not found, but is used in ${id}. Please add it to your \`.env\` configuration file.`
              );
            }

            result[name] = {
              name,
              description:
                type.jsDocs && type.jsDocs.length > 0
                  ? type.jsDocs[0]?.getDescription()
                  : undefined,
              value: dotenv.values[match]!,
              defaultValue,
              type: {
                type: type.type,
                text: type.text,
                isOptional: type.isOptional
              }
            };
          }
        }
      }
    }
  }

  return result;
};
