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
import * as t from "@babel/types";
import {
  deserializeType,
  ReflectionClass,
  ReflectionKind,
  resolveClassType
} from "@deepkit/type";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { convertFromCapnp } from "@storm-stack/core/lib/capnp";
import { stringifyValue } from "@storm-stack/core/lib/deepkit/utilities";
import { SerializedTypes as CapnpSerializedTypes } from "@storm-stack/core/schemas/reflection";
import {
  BabelPluginOptions,
  BabelPluginPass
} from "@storm-stack/core/types/babel";
import { declareBabel } from "@storm-stack/devkit/babel/declare-babel";
import { BabelPluginBuilderParams } from "@storm-stack/devkit/types";
import * as capnp from "@stryke/capnp";
import { readBufferFile } from "@stryke/fs/buffer";
import { existsSync } from "node:fs";
import {
  getConfigReflectionsPath,
  writeConfigReflection
} from "../helpers/persistence";
import { DotenvBabelPluginState } from "../types";

/*
 * The Storm Stack Babel Plugin
 *
 * @param babel - The Babel core module
 * @returns The Babel plugin object
 */
export default declareBabel(
  "dotenv",
  ({
    log,
    state
  }: BabelPluginBuilderParams<BabelPluginOptions, DotenvBabelPluginState>) => {
    const context = state.context;

    function extractConfig(
      node: t.Identifier,
      pass: BabelPluginPass<BabelPluginOptions>,
      isInjectable = false
    ) {
      const dotenvAliasProperties = context.reflections
        .configDotenv!.getProperties()
        .filter(prop => prop.getAlias().length > 0);

      if (node.name) {
        const prefix = context.options.dotenv.prefix.find(
          pre =>
            node.name &&
            node.name.startsWith(pre) &&
            (context.reflections.configDotenv!.hasProperty(
              node.name.replace(`${pre}_`, "")
            ) ||
              dotenvAliasProperties.some(prop =>
                prop.getAlias().includes(node.name.replace(`${pre}_`, ""))
              ))
        );

        let name = node.name;
        if (prefix) {
          name = node.name.replace(`${prefix}_`, "");
        }

        log(
          LogLevelLabel.TRACE,
          `Environment variable ${name} found in ${
            pass.filename || "unknown file"
          }.`
        );

        if (
          context.reflections.configDotenv!.hasProperty(name) ||
          dotenvAliasProperties.some(prop => prop.getAlias().includes(name))
        ) {
          const dotenvProperty = context.reflections.configDotenv!.hasProperty(
            name
          )
            ? context.reflections.configDotenv!.getProperty(name)
            : dotenvAliasProperties.find(prop =>
                prop.getAlias().includes(name)
              );
          if (!dotenvProperty || dotenvProperty.isIgnored()) {
            return;
          }

          if (!context.reflections.config!.hasProperty(name)) {
            context.reflections.config!.addProperty(dotenvProperty.property);
          }

          if (context.options.dotenv.inject && isInjectable) {
            let value = context.options.dotenv.values?.[name];
            if (value === undefined) {
              const prefix = context.options.dotenv.prefix.find(pre => {
                return context.options.dotenv.values[
                  `${pre.replace(/_$/g, "")}_${name}`
                ];
              });
              if (prefix) {
                value =
                  context.options.dotenv.values[
                    `${prefix.replace(/_$/g, "")}_${name}`
                  ];
              }
            }

            value ??= dotenvProperty.getDefaultValue();

            if (dotenvProperty.isValueRequired() && value === undefined) {
              throw new Error(
                `Environment variable \`${name}\` is not defined in the .env configuration files`
              );
            }

            return stringifyValue(dotenvProperty, value);
          }
        } else {
          throw new Error(
            `The "${name}" environment variable is not defined in the dotenv type definition, but is used in the source code file ${
              pass.filename ? pass.filename : "unknown"
            }.

    The following variable names are defined in the dotenv type definition: \n${context.reflections.configDotenv
      ?.getPropertyNames()
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
      )} \n\nUsing the following env prefix: \n${context.options.dotenv.prefix
      .map(prefix => ` - ${prefix}`)
      .join(
        "\n"
      )} \n\nPlease check your \`dotenv\` configuration option. If you are using a custom dotenv type definition, please make sure that the configuration names match the ones in the code. \n\n`
          );
        }
      }

      return undefined;
    }

    return {
      visitor: {
        MemberExpression(
          path: NodePath<t.MemberExpression>,
          pass: BabelPluginPass<BabelPluginOptions, DotenvBabelPluginState>
        ) {
          const node = path.get("object");
          if (node.isMemberExpression()) {
            const innerNode = node.get("object");

            if (
              innerNode.isIdentifier({ name: "$storm" }) &&
              node.get("property").isIdentifier({ name: "config" }) &&
              path.node.property &&
              t.isIdentifier(path.node.property)
            ) {
              const value = extractConfig(path.node.property, pass, false);
              if (value !== undefined) {
                path.replaceWithSourceString(value);
              }
            } else if (
              innerNode.isIdentifier({ name: "$storm" }) &&
              node.get("property").isIdentifier({ name: "dotenv" }) &&
              path.node.property &&
              t.isIdentifier(path.node.property)
            ) {
              const value = extractConfig(path.node.property, pass, true);
              if (value !== undefined) {
                path.replaceWithSourceString(value);
              }
            } else if (
              innerNode.isIdentifier({ name: "process" }) &&
              node.get("property").isIdentifier({ name: "env" }) &&
              path.node.property &&
              t.isIdentifier(path.node.property)
            ) {
              const value = extractConfig(path.node.property, pass, false);
              if (value !== undefined) {
                path.replaceWithSourceString(value);
              }
            } else if (
              innerNode.isMetaProperty() &&
              innerNode.get("meta").isIdentifier({ name: "import" }) &&
              innerNode.get("property").isIdentifier({ name: "meta" }) &&
              node.get("property").isIdentifier({ name: "env" }) &&
              path.node.property &&
              t.isIdentifier(path.node.property)
            ) {
              const value = extractConfig(path.node.property, pass, false);
              if (value !== undefined) {
                path.replaceWithSourceString(value);
              }
            } else if (
              innerNode.isCallExpression() &&
              innerNode.get("callee").isIdentifier({ name: "useStorm" }) &&
              node.get("property").isIdentifier({ name: "config" }) &&
              path.node.property &&
              t.isIdentifier(path.node.property)
            ) {
              const value = extractConfig(path.node.property, pass, false);
              if (value !== undefined) {
                path.replaceWithSourceString(value);
              }
            } else if (
              innerNode.isCallExpression() &&
              innerNode.get("callee").isIdentifier({ name: "useStorm" }) &&
              node.get("property").isIdentifier({ name: "dotenv" }) &&
              path.node.property &&
              t.isIdentifier(path.node.property)
            ) {
              const value = extractConfig(path.node.property, pass, true);
              if (value !== undefined) {
                path.replaceWithSourceString(value);
              }
            }
          }
        }
      },
      async post(
        this: BabelPluginPass<BabelPluginOptions, DotenvBabelPluginState>,
        _file: File
      ) {
        if (context.reflections.config!.getProperties().length > 0) {
          log(
            LogLevelLabel.TRACE,
            `Adding environment variables from ${
              this.filename || "unknown file"
            } to config.json.`
          );

          let persistedConfig = ReflectionClass.from({
            kind: ReflectionKind.objectLiteral,
            description: `An object containing the configuration parameters used by the application.`,
            types: []
          });

          const reflectionPath = getConfigReflectionsPath(context, "config");
          if (reflectionPath && existsSync(reflectionPath)) {
            log(
              LogLevelLabel.TRACE,
              `Config reflection file found at ${
                reflectionPath
              }, reading existing reflection.`
            );

            persistedConfig = resolveClassType(
              deserializeType(
                convertFromCapnp(
                  new capnp.Message(
                    await readBufferFile(reflectionPath),
                    false
                  ).getRoot(CapnpSerializedTypes).types
                )
              )
            );
          }

          log(
            LogLevelLabel.TRACE,
            `Adding new variables to config reflection at ${reflectionPath}.`
          );

          persistedConfig
            .getProperties()
            .filter(
              property =>
                !context.reflections.config!.hasProperty(property.name)
            )
            .forEach(property => {
              context.reflections.config!.addProperty({
                ...property,
                name: property.getName(),
                description:
                  property.getDescription() ?? `The ${property.name} variable.`,
                default: property.getDefaultValue(),
                optional: property.isOptional() ? true : undefined,
                readonly: property.isReadonly() ? true : undefined,
                visibility: property.getVisibility(),
                type: property.getType(),
                tags: property.getTags()
              } as Parameters<typeof persistedConfig.addProperty>[0]);
            });

          if (
            context.reflections.config!.getProperties().length > 0 &&
            context.reflections.config!.getProperties().length !==
              persistedConfig.getProperties().length &&
            context.reflections.config
          ) {
            log(
              LogLevelLabel.TRACE,
              `Writing config reflection types to ${reflectionPath}.`
            );

            await writeConfigReflection(
              context,
              context.reflections.config,
              "config"
            );
          }
        }
      }
    };
  }
);
