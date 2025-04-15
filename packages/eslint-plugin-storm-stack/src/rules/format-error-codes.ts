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

import { readJsonFileSync } from "@stryke/fs/read-file";
import { writeJsonFileSync } from "@stryke/fs/write-file";
import { deepClone } from "@stryke/helpers/deep-clone";
import { isEqual } from "@stryke/helpers/is-equal";
import { isSetString } from "@stryke/type-checks/is-set-string";
import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import type {
  RuleContext,
  RuleFixer
} from "@typescript-eslint/utils/ts-eslint";
import { existsSync } from "node:fs";
import { createEslintRule } from "../helpers/create-rule";

export const RULE_NAME = "format-error-codes";
export type MessageIds = "invalidErrorFormat";
export type Options = [
  {
    /**
     * The path to the JSON file containing the error codes.
     *
     * @defaultValue "./tools/errors/codes.json"
     */
    codesFile?: string;
  }
];

const DEFAULT_CODES_FILE = "./tools/errors/codes.json";

function invokeErrorExpression(
  context: Readonly<RuleContext<"invalidErrorFormat", Options>>,
  options: Options,
  node: TSESTree.NewExpression | TSESTree.CallExpression
) {
  let codesFile = DEFAULT_CODES_FILE;
  if (options[0]?.codesFile) {
    codesFile = options[0].codesFile;
  }

  if (
    node.callee.type === AST_NODE_TYPES.Identifier &&
    (node.callee.name === "Error" || node.callee.name === "StormError") &&
    node.arguments.length > 0 &&
    node.arguments[0]
  ) {
    let errorMessage = "";
    let params = [] as string[];

    if (
      node.arguments[0].type === AST_NODE_TYPES.Literal &&
      isSetString(node.arguments[0].value)
    ) {
      errorMessage = node.arguments[0].value;
    } else if (node.arguments[0]?.type === AST_NODE_TYPES.TemplateLiteral) {
      errorMessage = node.arguments[0].quasis
        .map(segment => segment.value.cooked)
        .join("%s");
      params = node.arguments[0].expressions.map(expression => {
        return context.sourceCode
          .getText(node)
          .substring(expression.range[0], expression.range[1]);
      });
    }

    if (errorMessage) {
      context.report({
        node,
        messageId: "invalidErrorFormat",
        fix(fixer: RuleFixer) {
          let errorCodes = {} as Record<string, Record<string, string>>;
          if (existsSync(codesFile)) {
            errorCodes =
              readJsonFileSync<Record<string, Record<string, string>>>(
                codesFile
              );
          }
          const originalErrorCodes = deepClone(errorCodes);

          let errorType = "general";
          if (
            node.arguments.length > 1 &&
            node.arguments[1] &&
            node.arguments[1].type === AST_NODE_TYPES.Literal &&
            isSetString(node.arguments[1].value)
          ) {
            errorType = node.arguments[1].value;
          }

          errorCodes[errorType] ??= {};
          let errorCode = Object.keys(errorCodes[errorType]!).find(
            key => errorCodes[errorType]![key] === errorMessage
          );
          if (!errorCode) {
            if (!errorCodes[errorType]) {
              errorCode = "1";
            } else {
              const keys = Object.keys(errorCodes[errorType] ?? {});
              if (keys.length === 0) {
                errorCode = "1";
              } else if (
                Number.isNaN(
                  Number.parseInt(keys.sort((a, b) => b.localeCompare(a))[0]!)
                )
              ) {
                errorCode = "1";
              } else {
                errorCode = String(
                  Number.parseInt(keys.sort((a, b) => b.localeCompare(a))[0]!) +
                    1
                );
              }
            }

            errorCodes[errorType]![errorCode] = errorMessage;
          }

          if (!isEqual(originalErrorCodes, errorCodes)) {
            writeJsonFileSync(codesFile, errorCodes);
          }

          return fixer.replaceText(
            node,
            `new StormError({ type: "${errorType}", code: ${errorCode}${params.length > 0 ? ` params: [${params.join(", ")}] ` : ""} })`
          );
        }
      });
    }
  }
}

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description:
        "Error messages should exist in a JSON file that's shared across the workspace when using Storm Stack"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          codesFile: {
            type: "string",
            description:
              "The path to the JSON file containing the error codes.",
            default: DEFAULT_CODES_FILE
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      invalidErrorFormat:
        "When using Storm Stack, Error messages should exist in a JSON file that's shared across the workspace."
    }
  },
  defaultOptions: [
    {
      codesFile: DEFAULT_CODES_FILE
    }
  ],
  create: context => {
    return {
      NewExpression(node) {
        invokeErrorExpression(context, context.options, node);
      },
      CallExpression(node) {
        invokeErrorExpression(context, context.options, node);
      }
    };
  }
});
