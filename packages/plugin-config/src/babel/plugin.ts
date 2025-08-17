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
import { stringifyDefaultValue } from "@storm-stack/core/lib/deepkit/utilities";
import { SerializedTypes as CapnpSerializedTypes } from "@storm-stack/core/schemas/reflection";
import { BabelPluginOptions } from "@storm-stack/core/types/babel";
import { declareBabel } from "@storm-stack/devkit/babel/declare-babel";
import * as capnp from "@stryke/capnp";
import { readFileBuffer } from "@stryke/fs/buffer";
import { existsSync } from "node:fs";
import {
  getConfigReflectionsPath,
  writeConfigReflection
} from "../helpers/persistence";
import {
  ConfigBabelPluginPass,
  ConfigBabelPluginState,
  ConfigPluginContext
} from "../types";

/*
 * The Storm Stack - Configuration Babel Plugin
 *
 * @param babel - The Babel core module
 * @returns The Babel plugin object
 */
export default declareBabel<
  BabelPluginOptions,
  ConfigPluginContext,
  ConfigBabelPluginState
>("config", ({ log, context }) => {
  function extractConfig(
    node: t.Identifier,
    pass: ConfigBabelPluginPass,
    isInjectable = false
  ) {
    const configTypesAliasProperties = context.reflections.config.types.params
      ?.getProperties()
      .filter(prop => prop.getAlias().length > 0);

    if (node.name) {
      const prefix = context.options.plugins.config.prefix.find(
        pre =>
          node.name &&
          node.name.startsWith(pre) &&
          (context.reflections.config.types.params?.hasProperty(
            node.name.replace(`${pre}_`, "")
          ) ||
            configTypesAliasProperties.some(prop =>
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
        context.reflections.config.types.params?.hasProperty(name) ||
        configTypesAliasProperties.some(prop => prop.getAlias().includes(name))
      ) {
        const configProperty =
          context.reflections.config.types.params.hasProperty(name)
            ? context.reflections.config.types.params.getProperty(name)
            : configTypesAliasProperties.find(prop =>
                prop.getAlias().includes(name)
              );
        if (!configProperty || configProperty.isIgnored()) {
          return;
        }

        if (!context.reflections.config.params.hasProperty(name)) {
          context.reflections.config.params.addProperty(
            configProperty.property
          );
        }

        if (context.options.plugins.config.inject && isInjectable) {
          let value = context.options.plugins.config.parsed?.[name];
          if (value === undefined) {
            const prefix = context.options.plugins.config.prefix.find(pre => {
              return context.options.plugins.config.parsed[
                `${pre.replace(/_$/g, "")}_${name}`
              ];
            });
            if (prefix) {
              value =
                context.options.plugins.config.parsed[
                  `${prefix.replace(/_$/g, "")}_${name}`
                ];
            }
          }

          value ??= configProperty.getDefaultValue();

          if (configProperty.isValueRequired() && value === undefined) {
            throw new Error(
              `Environment variable \`${name}\` is not defined in the .env configuration files`
            );
          }

          return stringifyDefaultValue(configProperty, value);
        }
      } else {
        throw new Error(
          `The "${name}" environment variable is not defined in the dotenv type definition, but is used in the source code file ${
            pass.filename ? pass.filename : "unknown"
          }.

          The following variable names are defined in the dotenv type definition: \n${context.reflections.config.types.params
            ?.getPropertyNames()
            .sort((a, b) => String(a).localeCompare(String(b)))
            .map(
              typeDef =>
                ` - ${String(typeDef)} ${
                  configTypesAliasProperties.some(
                    prop =>
                      prop.getNameAsString() === String(typeDef) &&
                      prop.getAlias().length > 0
                  )
                    ? `(Alias: ${configTypesAliasProperties
                        ?.find(
                          prop => prop.getNameAsString() === String(typeDef)
                        )
                        ?.getAlias()
                        .join(", ")})`
                    : ""
                }`
            )
            .join(
              "\n"
            )} \n\nUsing the following env prefix: \n${context.options.plugins.config.prefix
            .map(prefix => ` - ${prefix}`)
            .join(
              "\n"
            )} \n\nPlease check your \`config\` configuration option. If you are using a custom dotenv type definition, please make sure that the configuration names match the ones in the code. \n\n`
        );
      }
    }

    return undefined;
  }

  return {
    visitor: {
      MemberExpression(
        path: NodePath<t.MemberExpression>,
        pass: ConfigBabelPluginPass
      ) {
        if (
          path.get("object").get("property").isIdentifier({ name: "static" }) &&
          ((path
            .get("object")
            .get("object")
            .get("property")
            .isIdentifier({ name: "config" }) &&
            path
              .get("object")
              .get("object")
              .get("object")
              .isCallExpression({
                callee: { name: "useStorm", type: "Identifier" }
              })) ||
            path
              .get("object")
              .get("object")
              .get("object")
              .isIdentifier({ name: "$storm" })) &&
          path.get("property").isIdentifier()
        ) {
          // $storm.config.static.CONFIG_NAME / useStorm().config.static.CONFIG_NAME

          const identifier = path.get("property").node as t.Identifier;
          const value = extractConfig(identifier, pass, true);
          if (value !== undefined) {
            path.replaceWithSourceString(value);
          }
        } else if (
          path.get("object").get("property").isIdentifier({ name: "config" }) &&
          (path
            .get("object")
            .get("object")
            .isCallExpression({
              callee: { name: "useStorm", type: "Identifier" }
            }) ||
            path.get("object").get("object").isIdentifier({ name: "$storm" }))
        ) {
          // $storm.config.CONFIG_NAME / useStorm().config.CONFIG_NAME

          const identifier = path.get("property").node as t.Identifier;
          const value = extractConfig(identifier, pass, false);
          if (value !== undefined) {
            path.replaceWithSourceString(value);
          }
        } else if (
          path.get("object").get("property").isIdentifier({ name: "env" }) &&
          path.get("object").get("object").isIdentifier({ name: "process" }) &&
          path.get("property").isIdentifier()
        ) {
          // process.env.CONFIG_NAME

          const identifier = path.get("property").node as t.Identifier;
          if (!identifier.name) {
            return;
          }

          const value = extractConfig(identifier, pass, false);

          path.replaceWithSourceString(
            `${value !== undefined ? "(" : ""}useStorm().config.${
              identifier.name
            }${value !== undefined ? ` || ${value})` : ""}`
          );
        } else if (
          path.get("object").get("property").isIdentifier({ name: "env" }) &&
          path.get("object").get("object").isMetaProperty() &&
          path.get("property").isIdentifier()
        ) {
          // import.meta.env.CONFIG_NAME

          const identifier = path.get("property").node as t.Identifier;
          if (!identifier.name) {
            return;
          }

          const value = extractConfig(identifier, pass, false);

          path.replaceWithSourceString(
            `${value !== undefined ? "(" : ""}useStorm().config.${
              identifier.name
            }${value !== undefined ? ` || ${value})` : ""}`
          );
        }
      }
    },
    async post(this: ConfigBabelPluginPass, _file: File) {
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

      const reflectionPath = getConfigReflectionsPath(context, "params");
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
                await readFileBuffer(reflectionPath),
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
            property.getNameAsString() &&
            !context.reflections.config.params.hasProperty(
              property.getNameAsString()
            )
        )
        .forEach(property => {
          context.reflections.config.params.addProperty({
            ...property,
            name: property.getNameAsString(),
            description:
              property.getDescription() ??
              `The ${property.getNameAsString()} variable.`,
            default: property.getDefaultValue(),
            optional: property.isOptional() ? true : undefined,
            readonly: property.isReadonly() ? true : undefined,
            visibility: property.getVisibility(),
            type: property.getType(),
            tags: property.getTags()
          } as Parameters<typeof persistedConfig.addProperty>[0]);
        });

      if (
        context.reflections.config.params.getProperties().length > 0 &&
        context.reflections.config.params.getProperties().length !==
          persistedConfig.getProperties().length &&
        context.reflections.config.params
      ) {
        log(
          LogLevelLabel.TRACE,
          `Writing config reflection types to ${reflectionPath}.`
        );

        await writeConfigReflection(
          context,
          context.reflections.config.params,
          "params"
        );
      }
    }
  };
});
