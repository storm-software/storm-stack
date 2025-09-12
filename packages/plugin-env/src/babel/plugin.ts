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
import { LogLevelLabel } from "@storm-software/config-tools/types";
import {
  deserializeType,
  ReflectionClass,
  ReflectionKind,
  resolveClassType
} from "@storm-stack/core/deepkit/type";
import { addImport } from "@storm-stack/core/lib/babel/module";
import { convertFromCapnp } from "@storm-stack/core/lib/capnp";
import { stringifyDefaultValue } from "@storm-stack/core/lib/deepkit/utilities";
import { SerializedTypes as CapnpSerializedTypes } from "@storm-stack/core/schemas/reflection";
import { BabelPluginOptions } from "@storm-stack/core/types/babel";
import { declareBabel } from "@storm-stack/devkit/babel/declare-babel";
import * as capnp from "@stryke/capnp";
import { readFileBuffer } from "@stryke/fs/buffer";
import { existsSync } from "node:fs";
import {
  getEnvReflectionsPath,
  writeEnvReflection
} from "../helpers/persistence";
import { EnvBabelPluginPass, EnvBabelPluginState } from "../types/babel";
import { EnvPluginContext } from "../types/plugin";

/*
 * The Storm Stack - Environment Configuration Babel Plugin
 *
 * @param babel - The Babel core module
 * @returns The Babel plugin object
 */
export default declareBabel<
  BabelPluginOptions,
  EnvPluginContext,
  EnvBabelPluginState
>("env", ({ log, context }) => {
  function extractEnv(
    node: t.Identifier,
    pass: EnvBabelPluginPass,
    isInjectable = false
  ) {
    const envTypesAliasProperties = context.reflections.env.types.env
      ?.getProperties()
      .filter(prop => prop.getAlias().length > 0);

    if (node.name) {
      const prefix = context.options.plugins.env.prefix.find(
        pre =>
          node.name &&
          node.name.startsWith(pre) &&
          (context.reflections.env.types.env?.hasProperty(
            node.name.replace(`${pre}_`, "")
          ) ||
            envTypesAliasProperties.some(prop =>
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
        context.reflections.env.types.env?.hasProperty(name) ||
        envTypesAliasProperties.some(prop => prop.getAlias().includes(name))
      ) {
        const envProperty = context.reflections.env.types.env.hasProperty(name)
          ? context.reflections.env.types.env.getProperty(name)
          : envTypesAliasProperties.find(prop =>
              prop.getAlias().includes(name)
            );
        if (!envProperty || envProperty.isIgnored()) {
          return;
        }

        if (!context.reflections.env.env.hasProperty(name)) {
          context.reflections.env.env.addProperty(envProperty.property);
        }

        if (context.options.plugins.env.inject && isInjectable) {
          let value = context.options.plugins.env.parsed?.[name];
          if (value === undefined) {
            const prefix = context.options.plugins.env.prefix.find(pre => {
              return context.options.plugins.env.parsed[
                `${pre.replace(/_$/g, "")}_${name}`
              ];
            });
            if (prefix) {
              value =
                context.options.plugins.env.parsed[
                  `${prefix.replace(/_$/g, "")}_${name}`
                ];
            }
          }

          value ??= envProperty.getDefaultValue();

          if (envProperty.isValueRequired() && value === undefined) {
            throw new Error(
              `Environment variable \`${name}\` is not defined in the .env configuration files`
            );
          }

          return stringifyDefaultValue(envProperty, value);
        }
      } else {
        throw new Error(
          `The "${name}" environment variable is not defined in the dotenv type definition, but is used in the source code file ${
            pass.filename ? pass.filename : "unknown"
          }.

          The following variable names are defined in the dotenv type definition: \n${context.reflections.env.types.env
            ?.getPropertyNames()
            .sort((a, b) => String(a).localeCompare(String(b)))
            .map(
              typeDef =>
                ` - ${String(typeDef)} ${
                  envTypesAliasProperties.some(
                    prop =>
                      prop.getNameAsString() === String(typeDef) &&
                      prop.getAlias().length > 0
                  )
                    ? `(Alias: ${envTypesAliasProperties
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
            )} \n\nUsing the following env prefix: \n${context.options.plugins.env.prefix
            .map(prefix => ` - ${prefix}`)
            .join(
              "\n"
            )} \n\nPlease check your \`env\` configuration option. If you are using a custom dotenv type definition, please make sure that the configuration names match the ones in the code. \n\n`
        );
      }
    }

    return undefined;
  }

  return {
    visitor: {
      MemberExpression(
        path: NodePath<t.MemberExpression>,
        pass: EnvBabelPluginPass
      ) {
        if (
          path.get("object")?.get("property")?.isIdentifier({ name: "env" }) &&
          path.get("object")?.get("object")?.isIdentifier({ name: "$storm" }) &&
          path.get("property")?.isIdentifier()
        ) {
          // $storm.env.CONFIG_NAME

          const identifier = path.get("property")?.node as t.Identifier;
          extractEnv(identifier, pass, true);

          path.replaceWithSourceString(`env.${identifier.name}`);
          addImport(path, {
            module: "storm:env",
            name: "env",
            imported: "env"
          });
        } else if (
          path.get("object")?.get("property")?.isIdentifier({ name: "env" }) &&
          path
            .get("object")
            ?.get("object")
            ?.isCallExpression({
              callee: { name: "useStorm", type: "Identifier" }
            }) &&
          path.get("property")?.isIdentifier()
        ) {
          // useStorm().env.CONFIG_NAME

          const identifier = path.get("property")?.node as t.Identifier;
          extractEnv(identifier, pass, false);

          path.replaceWithSourceString(`env.${identifier.name}`);
          addImport(path, {
            module: "storm:env",
            name: "env",
            imported: "env"
          });
        } else if (
          path.get("object")?.get("property")?.isIdentifier({ name: "env" }) &&
          path
            .get("object")
            ?.get("object")
            ?.isIdentifier({ name: "process" }) &&
          path.get("property")?.isIdentifier()
        ) {
          // process.env.CONFIG_NAME

          const identifier = path.get("property")?.node as t.Identifier;
          if (!identifier.name) {
            return;
          }

          extractEnv(identifier, pass, false);

          path.replaceWithSourceString(`env.${identifier.name}`);
          addImport(path, {
            module: "storm:env",
            name: "env",
            imported: "env"
          });
        } else if (
          path.get("object")?.get("property")?.isIdentifier({ name: "env" }) &&
          path.get("object")?.get("object")?.isMetaProperty() &&
          path.get("property")?.isIdentifier()
        ) {
          // import.meta.env.CONFIG_NAME

          const identifier = path.get("property")?.node as t.Identifier;
          if (!identifier.name) {
            return;
          }

          const value = extractEnv(identifier, pass, false);

          path.replaceWithSourceString(
            `${value !== undefined ? "(" : ""}$storm.env.${
              identifier.name
            }${value !== undefined ? ` || ${value})` : ""}`
          );
        }
      }
    },
    async post(this: EnvBabelPluginPass, _file: File) {
      log(
        LogLevelLabel.TRACE,
        `Adding environment variables from ${
          this.filename || "unknown file"
        } to env.json.`
      );

      let persistedEnv = ReflectionClass.from({
        kind: ReflectionKind.objectLiteral,
        description: `An object containing the environment variables used by the application.`,
        types: []
      });

      const reflectionPath = getEnvReflectionsPath(context, "env");
      if (reflectionPath && existsSync(reflectionPath)) {
        log(
          LogLevelLabel.TRACE,
          `Environment reflection file found at ${
            reflectionPath
          }, reading existing reflection.`
        );

        persistedEnv = resolveClassType(
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
        `Adding new variables to env reflection at ${reflectionPath}.`
      );

      persistedEnv
        .getProperties()
        .filter(
          property =>
            property.getNameAsString() &&
            !context.reflections.env.env.hasProperty(property.getNameAsString())
        )
        .forEach(property => {
          context.reflections.env.env.addProperty({
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
          } as Parameters<typeof persistedEnv.addProperty>[0]);
        });

      if (
        context.reflections.env.env.getProperties().length > 0 &&
        context.reflections.env.env.getProperties().length !==
          persistedEnv.getProperties().length &&
        context.reflections.env.env
      ) {
        log(
          LogLevelLabel.TRACE,
          `Writing env reflection types to ${reflectionPath}.`
        );

        await writeEnvReflection(context, context.reflections.env.env, "env");
      }
    }
  };
});
