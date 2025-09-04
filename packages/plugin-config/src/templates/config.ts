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

import {
  ReflectionClass,
  ReflectionKind,
  ReflectionProperty
} from "@storm-stack/core/deepkit";
import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import {
  generateTypeScriptInterface,
  generateTypeScriptObject
} from "@storm-stack/devkit/templates/helpers/typescript";
import { titleCase } from "@stryke/string-format/title-case";
import { loadConfigFromContext } from "../helpers/load";
import { createTemplateReflection } from "../helpers/template-helpers";
import { ConfigPluginContext } from "../types";

/**
 * Generates the configuration typescript definition for the Storm Stack project.
 *
 * @param context - The context for the configuration module, which includes options and runtime information.
 * @returns The generated configuration module as a string.
 */
export async function ConfigTypeDefinition(
  context: ConfigPluginContext,
  reflection: ReflectionClass<any>
): Promise<string> {
  const defaultValues = loadConfigFromContext(context, process.env);

  return `
${generateTypeScriptInterface(reflection, {
  overrideName: "StormConfigBase",
  overrideExtends: "StormConfigInterface",
  defaultValues
})}

export type StormConfig = {
  [Key in keyof StormConfigBase as Key ${context.options.plugins.config.prefix
    .map(prefix => `| \`${prefix.replace(/_$/g, "")}_\${Key}\``)
    .join(" ")}]: StormConfigBase[Key];
};

`;
}

/**
 * Generates the configuration module for the Storm Stack project.
 *
 * @param context - The context for the configuration module, which includes options and runtime information.
 * @param environmentConfig - The dynamic/runtime configuration - this could include the current environment variables or any other environment-specific settings provided by the runtime.
 * @returns The generated configuration module as a string.
 */
export async function ConfigModule(
  context: ConfigPluginContext,
  environmentConfig?: string
): Promise<string> {
  const reflection = await createTemplateReflection(context, "params");

  const configInstance = new ReflectionClass(
    {
      kind: ReflectionKind.objectLiteral,
      description: `The initial configuration state for the ${titleCase(
        context.options.name
      )} project.`,
      types: []
    },
    reflection
  );
  configInstance.name = "initialConfig";

  const defaultValues = loadConfigFromContext(context, process.env);

  return `
/**
 * The Storm Stack configuration module provides an interface to define configuration parameters.
 *
 * @module storm:config
 */

${getFileHeader()}

import {
  Type,
  stringify,
  serializer,
  serializeFunction,
  deserializeFunction,
  ReflectionKind,
  TemplateState,
  Serializer,
  TypeProperty,
  TypePropertySignature
} from "@storm-stack/core/deepkit";
import { StormConfigInterface } from "@storm-stack/types/config";

${await ConfigTypeDefinition(context, reflection)}

${generateTypeScriptObject(configInstance, {
  overrideExtends: "StormConfigBase",
  defaultValues
})}

/**
 * The configuration serializer for the Storm Stack application.
 *
 * @see https://deepkit.io/docs/serialization/serializers
 * @see https://github.com/marcj/untitled-code/blob/master/packages/type/src/serializer.ts#L1918
 *
 * @remarks
 * This serializer is used to serialize and deserialize the Storm Stack configuration.
 */
export class ConfigSerializer extends Serializer {
  public constructor() {
    super("config");

    this.deserializeRegistry.register(
      ReflectionKind.boolean,
      (type: Type, state: TemplateState) => {
        state.addSetter(
          \`typeof \${state.accessor.toString()} !== "boolean" && state.loosely !== false ? \${state.accessor.toString()} === 1 || \${state.accessor.toString()} === "1" || \${state.accessor.toString()}.toLowerCase() === "t" || \${state.accessor.toString()}.toLowerCase() === "true" || \${state.accessor.toString()}.toLowerCase() === "y" || \${state.accessor.toString()}.toLowerCase() === "yes" : \${state.accessor.toString()}\`
        );
      }
    );
  }
}

/**
 * A {@link ConfigSerializer | configuration serializer} instance for the Storm Stack application.
 *
 * @see https://deepkit.io/docs/serialization/serializers
 * @see https://github.com/marcj/untitled-code/blob/master/packages/type/src/serializer.ts#L1918
 *
 * @remarks
 * This serializer is used to serialize and deserialize the Storm Stack configuration.
 */
export const configSerializer = new ConfigSerializer();

/**
 * Serialize a configuration object to JSON data objects (not a JSON string).
 *
 * The resulting JSON object can be stringified using JSON.stringify().
 *
 * \`\`\`typescript
 * const json = deserialize(config);
 * \`\`\`
 *
 * @throws ValidationError when serialization or validation fails.
 */
export const serializeConfig = serializeFunction<StormConfigBase>(configSerializer);

/**
 * Deserialize a configuration object from JSON data objects to JavaScript objects, without running any validators.
 *
 * Types that are already correct will be used as-is.
 *
 * \`\`\`typescript
 * const config = deserialize(json);
 * \`\`\`
 *
 * @throws ValidationError when deserialization fails.
 */
export const deserializeConfig = deserializeFunction<StormConfigBase>(configSerializer);

/**
 * Initializes the Storm Stack configuration module.
 *
 * @remarks
 * This function initializes the Storm Stack configuration object.
 *
 * @param environmentConfig - The dynamic/runtime configuration - this could include the current environment variables or any other environment-specific settings provided by the runtime.
 * @returns The initialized Storm Stack configuration object.
 */
export function createConfig(environmentConfig = ${
    environmentConfig || "{}"
  } as Partial<StormConfig>): StormConfig {
  return new Proxy<StormConfig>(
    deserializeConfig({
      ...initialConfig,
      ...environmentConfig
    }) as StormConfig,
    {
      get: (target: StormConfigBase, propertyName: string) => {
        ${reflection
          .getProperties()
          .filter(property => !property.isIgnored())
          .sort((a, b) =>
            a.getNameAsString().localeCompare(b.getNameAsString())
          )
          .map(property =>
            configGet(context, property.getNameAsString(), property)
          )
          .join("\n else \n")}

        return undefined;
      },
      set: (target: StormConfigBase, propertyName: string, newValue: any) => {
        ${reflection
          .getProperties()
          .filter(property => !property.isIgnored() && !property.isReadonly())
          .sort((a, b) =>
            a.getNameAsString().localeCompare(b.getNameAsString())
          )
          .map(property =>
            configSet(context, property.getNameAsString(), property)
          )
          .join("\n else \n")}

        return false;
      },
    }
  );
}
${
  environmentConfig
    ? `
export const config = createConfig();`
    : ""
}
`;
}

export function configPropertyConditional(
  context: ConfigPluginContext,
  propertyName: string
): string {
  return `propertyName.replace(/^(${context.options.plugins.config.prefix
    .sort((a, b) =>
      a.startsWith(b) ? -1 : b.startsWith(a) ? 1 : a.localeCompare(b)
    )
    .map(prefix => `${prefix.replace(/_$/, "")}_`)
    .join(
      "|"
    )})/g, "").toLowerCase().replace(/[\\s\\-_]+/g, "") === "${propertyName
    .toLowerCase()
    .replace(/[\s\-_]+/g, "")}"`;
}

export function configGet(
  context: ConfigPluginContext,
  propertyName: string,
  propertyReflection: ReflectionProperty
): string {
  return `if (${configPropertyConditional(context, propertyName)}${
    propertyReflection.getAlias().length
      ? ` || ${propertyReflection
          .getAlias()
          .map(alias => configPropertyConditional(context, alias))
          .join(" || ")}`
      : ""
  }) {
    return target["${propertyName}"];
  }`;
}

export function configSet(
  context: ConfigPluginContext,
  propertyName: string,
  propertyReflection: ReflectionProperty
): string {
  return `if (${configPropertyConditional(context, propertyName)}${
    propertyReflection.getAlias().length
      ? ` || ${propertyReflection
          .getAlias()
          .map(alias => configPropertyConditional(context, alias))
          .join(" || ")}`
      : ""
  }) {
    target["${propertyName}"] = newValue;
    return true;
  }`;
}
