/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { File, NodePath } from "@babel/core";
import generate from "@babel/generator";
import * as t from "@babel/types";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { getImport, listImports } from "@storm-stack/core/lib/babel/module";
import {
  BabelPluginOptions,
  BabelPluginPass,
  BabelPluginState
} from "@storm-stack/core/types/babel";
import { declareBabel } from "@storm-stack/devkit/babel/declare-babel";
import { BabelPluginBuilderParams } from "@storm-stack/devkit/types";
import { ErrorType } from "@storm-stack/types/shared/error";

const ERROR_CLASSES = [
  "Error",
  "TypeError",
  "RangeError",
  "EvalError",
  "ReferenceError",
  "SyntaxError",
  "URIError",
  "AggregateError",
  "InternalError",
  "SecurityError",
  "NetworkError",
  "NotFoundError",
  "TimeoutError",
  "AbortError",
  "TypeError",
  "DOMException",
  "DOMError",
  "StormError"
] as const;

const ERROR_TYPES: string[] = [
  "general",
  "not_found",
  "validation",
  "service_unavailable",
  "action_unsupported",
  "security",
  "unknown"
] as const;

interface ExtractedErrorMessage {
  type?: ErrorType;
  message: string;
  params: string[];
}

export type ErrorBabelPluginState = BabelPluginState<BabelPluginOptions> & {
  errorMessages: ExtractedErrorMessage[];
};

/*
 * The Storm Stack Babel Plugin
 *
 * @param babel - The Babel core module
 * @returns The Babel plugin object
 */
export default declareBabel(
  "error",
  ({
    log
  }: BabelPluginBuilderParams<BabelPluginOptions, ErrorBabelPluginState>) => {
    function requiresImport(
      pass: BabelPluginPass<BabelPluginOptions, ErrorBabelPluginState>
    ): boolean {
      return !listImports(pass.file.ast).includes("storm:error");
    }

    function extractErrorMessage(
      node: t.Expression | t.SpreadElement | t.ArgumentPlaceholder
    ): ExtractedErrorMessage | undefined {
      let result: ExtractedErrorMessage | undefined;

      if (t.isStringLiteral(node)) {
        result = {
          message: node.value,
          params: []
        };
      } else if (t.isTemplateLiteral(node)) {
        const parts = [] as string[];
        for (let i = 0; i < node.quasis.length; i++) {
          const elementNode = node.quasis[i];
          if (!t.isTemplateElement(elementNode) || !elementNode.value.cooked) {
            throw new Error(
              `Unsupported type provided as template element ${node.type}`
            );
          }

          parts.push(elementNode.value.cooked);
        }

        result = {
          message: parts.join("%s"),
          params: node.expressions.map(expr => generate(expr).code)
        };
      } else if (t.isBinaryExpression(node)) {
        if (node.operator !== "+") {
          throw new Error(`Unsupported binary operator ${node.operator}`);
        }
        if (!t.isExpression(node.left)) {
          throw new Error(`Unsupported left operand ${node.left.type}`);
        }

        const leftResult = extractErrorMessage(node.left);
        const rightResult = extractErrorMessage(node.right);
        if (!leftResult && !rightResult) {
          return undefined;
        }

        return {
          message: (leftResult?.message ?? "") + (rightResult?.message ?? ""),
          params: (leftResult?.params ?? []).concat(rightResult?.params ?? [])
        };
      } else if (!t.isObjectExpression(node)) {
        throw new Error(
          `Unsupported type provided as error message ${node.type}`
        );
      }

      return result;
    }

    function extractErrorType(
      node: t.Expression | t.SpreadElement | t.ArgumentPlaceholder
    ): ErrorType | undefined {
      if (t.isStringLiteral(node)) {
        return node.value as ErrorType;
      } else if (t.isObjectExpression(node)) {
        const property = node.properties.find(
          prop =>
            t.isObjectProperty(prop) &&
            t.isIdentifier(prop.key) &&
            prop.key.name === "type" &&
            prop.value &&
            t.isStringLiteral(prop.value)
        );
        if (
          property &&
          t.isObjectProperty(property) &&
          t.isStringLiteral(property.value)
        ) {
          return property.value.value as ErrorType;
        }
      }

      return undefined;
    }

    return {
      visitor: {
        NewExpression(
          path: NodePath<t.NewExpression>,
          pass: BabelPluginPass<BabelPluginOptions, ErrorBabelPluginState>
        ) {
          if (
            ERROR_CLASSES.some(name =>
              path.get("callee").isIdentifier({ name })
            )
          ) {
            if (path.node.arguments.length > 0 && path.node.arguments[0]) {
              const errorMessage = extractErrorMessage(path.node.arguments[0]);
              if (errorMessage) {
                let errorType: ErrorType | undefined;
                if (path.node.arguments.length > 1 && path.node.arguments[1]) {
                  const errorType = extractErrorType(path.node.arguments[1]);
                  if (errorType && !ERROR_TYPES.includes(errorType)) {
                    throw new Error(
                      `Unsupported error type provided: ${errorType}`
                    );
                  }
                }

                pass.errorMessages ??= [];
                pass.errorMessages.push({
                  message: errorMessage.message,
                  params: errorMessage.params,
                  type: errorType
                });

                if (requiresImport(pass)) {
                  log(
                    LogLevelLabel.TRACE,
                    `Adding import for storm:error module.`
                  );

                  (
                    path.scope.getProgramParent().path as NodePath<t.Program>
                  ).unshiftContainer(
                    "body",
                    getImport("storm:error", "StormError")
                  );
                }
              }
            }
          }
        },
        CallExpression(
          path: NodePath<t.CallExpression>,
          pass: BabelPluginPass<BabelPluginOptions, ErrorBabelPluginState>
        ) {
          if (
            ERROR_CLASSES.some(name =>
              path.get("callee").isIdentifier({ name })
            )
          ) {
            if (path.node.arguments.length > 0 && path.node.arguments[0]) {
              const errorMessage = extractErrorMessage(path.node.arguments[0]);
              if (errorMessage) {
                let errorType: ErrorType | undefined;
                if (path.node.arguments.length > 1 && path.node.arguments[1]) {
                  const errorType = extractErrorType(path.node.arguments[1]);
                  if (errorType && !ERROR_TYPES.includes(errorType)) {
                    throw new Error(
                      `Unsupported error type provided: ${errorType}`
                    );
                  }
                }

                pass.errorMessages ??= [];
                pass.errorMessages.push({
                  message: errorMessage.message,
                  params: errorMessage.params,
                  type: errorType
                });

                if (requiresImport(pass)) {
                  log(
                    LogLevelLabel.TRACE,
                    `Adding import for storm:error module.`
                  );

                  (
                    path.scope.getProgramParent().path as NodePath<t.Program>
                  ).unshiftContainer(
                    "body",
                    getImport("storm:error", "StormError")
                  );
                }
              }
            }
          }
        },
        ReferencedIdentifier(
          path: NodePath<t.Identifier>,
          pass: BabelPluginPass<BabelPluginOptions, ErrorBabelPluginState>
        ) {
          if (
            path.isReferencedIdentifier({ name: "StormError" }) &&
            !requiresImport(pass)
          ) {
            (
              path.scope.getProgramParent().path as NodePath<t.Program>
            ).unshiftContainer("body", getImport("storm:error", "StormError"));
          }
        }
      },
      async post(
        this: BabelPluginPass<BabelPluginOptions, ErrorBabelPluginState>,
        _file: File
      ) {
        log(
          LogLevelLabel.TRACE,
          `Post-processing the Storm Stack error plugin.`
        );

        // if (this.configReflection.getProperties().length > 0) {
        //  this.log(
        //     LogLevelLabel.TRACE,
        //     `Adding environment variables from ${
        //       this.filename || "unknown file"
        //     } to config.json.`
        //   );

        //   let existingReflection: ReflectionClass<unknown> =
        //     ReflectionClass.from({
        //       kind: ReflectionKind.objectLiteral,
        //       description: `An object containing the dotenv variables used by the application.`,
        //       types: []
        //     });

        //   const reflectionPath = getConfigReflectionsPath(
        //     this.context,
        //     "config"
        //   );
        //   if (reflectionPath && existsSync(reflectionPath)) {
        //     this.log(
        //       LogLevelLabel.TRACE,
        //       `Config reflection file found at ${reflectionPath}, reading existing reflection.`
        //     );

        //     existingReflection = resolveClassType(
        //       deserializeType(
        //         convertFromCapnp(
        //           new capnp.Message(
        //             await readBufferFile(reflectionPath),
        //             false
        //           ).getRoot(CapnpSerializedTypes).types
        //         )
        //       )
        //     );
        //   }

        //   this.log(
        //     LogLevelLabel.TRACE,
        //     `Adding new variables to config reflection at ${reflectionPath}.`
        //   );

        //   existingReflection
        //     .getProperties()
        //     .filter(
        //       property => !this.configReflection.hasProperty(property.name)
        //     )
        //     .forEach(property => {
        //       this.configReflection.addProperty({
        //         ...property,
        //         name: property.getName(),
        //         description:
        //           property.getDescription() ?? `The ${property.name} variable.`,
        //         default: property.getDefaultValue(),
        //         optional: property.isOptional() ? true : undefined,
        //         readonly: property.isReadonly() ? true : undefined,
        //         visibility: property.getVisibility(),
        //         type: property.getType(),
        //         tags: property.getTags()
        //       } as Parameters<typeof existingReflection.addProperty>[0]);
        //     });

        //   const serialized = this.configReflection.serializeType();

        //   const message = new capnp.Message();
        //   const root = message.initRoot(CapnpSerializedTypes);

        //   convertToCapnp(serialized, root._initTypes(serialized.length));

        //   await removeFile(reflectionPath);
        //   await writeBufferFile(reflectionPath, message.toArrayBuffer());
        // }
      }
    };
  }
);
