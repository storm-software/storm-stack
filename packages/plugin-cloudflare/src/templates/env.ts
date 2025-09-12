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
  ReflectionKind
} from "@storm-stack/core/deepkit/type";
import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import { generateTypeScriptObject } from "@storm-stack/devkit/templates/helpers/typescript";
import { loadEnvFromContext } from "@storm-stack/plugin-env/helpers/load";
import { createTemplateReflection } from "@storm-stack/plugin-env/helpers/template-helpers";
import {
  configGet,
  configSet,
  EnvTypeDefinition
} from "@storm-stack/plugin-env/templates/env";
import { titleCase } from "@stryke/string-format/title-case";
import { CloudflarePluginContext } from "../types/plugin";

/**
 * Generates the environment configuration module for the Storm Stack project.
 *
 * @param context - The context for the configuration module, which includes options and runtime information.
 * @returns The generated configuration module as a string.
 */
export async function EnvModule(
  context: CloudflarePluginContext
): Promise<string> {
  const reflection = await createTemplateReflection(context, "env");

  const envInstance = new ReflectionClass(
    {
      kind: ReflectionKind.objectLiteral,
      description: `The initial environment configuration state for the ${titleCase(
        context.options.name
      )} project.`,
      types: []
    },
    reflection
  );
  envInstance.name = "initialEnv";

  const defaultValues = loadEnvFromContext(context, process.env);

  return `
/**
 * The Storm Stack environment configuration module provides an interface to define environment configuration parameters.
 *
 * @module storm:env
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
} from "@storm-stack/core/deepkit/type";
import { StormEnvInterface } from "@storm-stack/core/runtime-types/shared/env";
import { env as cloudflareEnv } from "cloudflare:workers";

${await EnvTypeDefinition(context, reflection)}

${generateTypeScriptObject(envInstance, {
  overrideExtends: "StormEnvBase",
  defaultValues
})}

/**
 * The environment configuration serializer for the Storm Stack application.
 *
 * @see https://deepkit.io/docs/serialization/serializers
 * @see https://github.com/marcj/untitled-code/blob/master/packages/type/src/serializer.ts#L1918
 *
 * @remarks
 * This serializer is used to serialize and deserialize the Storm Stack environment configuration.
 */
export class EnvSerializer extends Serializer {
  public constructor() {
    super("env");

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
 * A {@link EnvSerializer | environment configuration serializer} instance for the Storm Stack application.
 *
 * @see https://deepkit.io/docs/serialization/serializers
 * @see https://github.com/marcj/untitled-code/blob/master/packages/type/src/serializer.ts#L1918
 *
 * @remarks
 * This serializer is used to serialize and deserialize the Storm Stack environment configuration.
 */
const envSerializer = new EnvSerializer();

/**
 * Serialize a environment configuration object to JSON data objects (not a JSON string).
 *
 * The resulting JSON object can be stringified using JSON.stringify().
 *
 * \`\`\`typescript
 * const json = serializeEnv(env);
 * \`\`\`
 *
 * @throws ValidationError when serialization or validation fails.
 */
export const serializeEnv = serializeFunction<StormEnvBase>(envSerializer);

/**
 * Deserialize a environment configuration object from JSON data objects to JavaScript objects, without running any validators.
 *
 * Types that are already correct will be used as-is.
 *
 * \`\`\`typescript
 * const env = deserializeEnv(json);
 * \`\`\`
 *
 * @throws ValidationError when deserialization fails.
 */
export const deserializeEnv = deserializeFunction<StormEnvBase>(envSerializer);

/**
 * Initializes the Storm Stack environment configuration module.
 *
 * @remarks
 * This function initializes the Storm Stack environment configuration object.
 *
 * @param environmentConfig - The dynamic/runtime configuration - this could include the current environment variables or any other environment-specific settings provided by the runtime.
 * @returns The initialized Storm Stack configuration object.
 */
export function createEnv(environmentConfig: Partial<StormEnv> = cloudflareEnv as Partial<StormEnv>): StormEnv {
  return new Proxy<StormEnv>(
    deserializeEnv({
      ...initialEnv,
      ...environmentConfig
    }) as StormEnv,
    {
      get: (target: StormEnvBase, propertyName: string) => {
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
      set: (target: StormEnvBase, propertyName: string, newValue: any) => {
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

export const env = createEnv();

`;
}
