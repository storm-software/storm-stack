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
  Children,
  code,
  computed,
  createResource,
  For,
  Show,
  splitProps
} from "@alloy-js/core";
import {
  ClassDeclaration,
  ClassMethod,
  ElseIfClause,
  FunctionDeclaration,
  IfStatement,
  NewExpression,
  TypeDeclaration,
  VarDeclaration
} from "@alloy-js/typescript";
import {
  ReflectionClass,
  ReflectionKind,
  ReflectionProperty
} from "@storm-stack/core/deepkit/type";
import {
  BuiltinFile,
  BuiltinFileProps
} from "@storm-stack/devkit/templates/components/builtin-file";
import {
  TSDoc,
  TSDocExample,
  TSDocLink,
  TSDocParam,
  TSDocRemarks,
  TSDocReturns,
  TSDocThrows
} from "@storm-stack/devkit/templates/components/tsdoc";
import {
  TypeScriptInterface,
  TypeScriptInterfaceProps
} from "@storm-stack/devkit/templates/components/typescript-interface";
import { TypescriptObject } from "@storm-stack/devkit/templates/components/typescript-object";
import { useStorm } from "@storm-stack/devkit/templates/context/context";
import { refkey } from "@storm-stack/devkit/templates/helpers/refkey";
import { ComponentProps } from "@storm-stack/devkit/types/templates";
import { titleCase } from "@stryke/string-format/title-case";
import { isNull } from "@stryke/type-checks/is-null";
import defu from "defu";
import { loadEnvFromContext } from "../helpers/load";
import { readEnvTypeReflection } from "../helpers/persistence";
import { EnvPluginContext } from "../types/plugin";

/**
 * Generates the environment configuration typescript definition for the Storm Stack project.
 */
export function EnvTypeDefinition(
  props: Omit<TypeScriptInterfaceProps, "name">
) {
  const [{ defaultValue, reflection }] = splitProps(props, [
    "defaultValue",
    "reflection"
  ]);

  const context = useStorm<EnvPluginContext>();

  return (
    <>
      <TypeScriptInterface
        name="StormEnvBase"
        extends={["StormEnvInterface"]}
        defaultValue={defaultValue}
        reflection={reflection}
        export={true}
      />
      <hbr />
      <hbr />

      <TypeDeclaration name="StormEnv" export={true}>
        {code` {
    [Key in keyof StormEnvBase as Key ${context?.value?.options?.plugins.env.prefix
      .map(prefix => `| \`${prefix.replace(/_$/g, "")}_\${Key}\``)
      .join(" ")}]: StormEnvBase[Key];
}
`}
      </TypeDeclaration>
    </>
  );
}

interface ConfigPropertyConditionalProps extends ComponentProps {
  context: EnvPluginContext | undefined;
  name: string;
}

function ConfigPropertyConditional(props: ConfigPropertyConditionalProps) {
  const [{ context, name }] = splitProps(props, ["context", "name"]);

  if (!context) {
    return null;
  }

  return code`propertyName === "${name}" || propertyName.replace(/^(${context.options?.plugins.env.prefix
    .sort((a, b) =>
      a.startsWith(b) ? -1 : b.startsWith(a) ? 1 : a.localeCompare(b)
    )
    .map(prefix => `${prefix.replace(/_$/, "")}_`)
    .join("|")})/g, "").toLowerCase().replace(/[\\s\\-_]+/g, "") === "${name
    .toLowerCase()
    .replace(/[\s\-_]+/g, "")}"`;
}

interface ConfigPropertyProps extends ComponentProps {
  index: number;
  context: EnvPluginContext | undefined;
  property: ReflectionProperty;
}

function ConfigPropertyGet(props: ConfigPropertyProps) {
  const [{ context, property, index }] = splitProps(props, [
    "context",
    "property",
    "index"
  ]);

  if (!context) {
    return null;
  }

  return (
    <>
      {index === 0 ? (
        <IfStatement
          condition={
            <>
              <ConfigPropertyConditional
                name={property.getNameAsString()}
                context={context}
              />
              <Show
                when={property.getAlias() && property.getAlias().length > 0}>
                {code` || `}
                <For each={property.getAlias()} joiner={code` || `}>
                  {alias => (
                    <ConfigPropertyConditional name={alias} context={context} />
                  )}
                </For>
              </Show>
            </>
          }>
          {code`return target["${property.getNameAsString()}"];`}
        </IfStatement>
      ) : (
        <ElseIfClause
          condition={
            <>
              <ConfigPropertyConditional
                name={property.getNameAsString()}
                context={context}
              />
              <Show
                when={property.getAlias() && property.getAlias().length > 0}>
                {code` || `}
                <For each={property.getAlias()} joiner={code` || `}>
                  {alias => (
                    <ConfigPropertyConditional name={alias} context={context} />
                  )}
                </For>
              </Show>
            </>
          }>
          {code`return target["${property.getNameAsString()}"];`}
        </ElseIfClause>
      )}
    </>
  );
}

function ConfigPropertySet(props: ConfigPropertyProps) {
  const [{ context, property, index }] = splitProps(props, [
    "context",
    "property",
    "index"
  ]);

  if (!context) {
    return null;
  }

  return (
    <>
      {index === 0 ? (
        <IfStatement
          condition={
            <>
              <ConfigPropertyConditional
                name={property.getNameAsString()}
                context={context}
              />
              <Show
                when={property.getAlias() && property.getAlias().length > 0}>
                {code` || `}
                <For each={property.getAlias()} joiner={code` || `}>
                  {alias => (
                    <ConfigPropertyConditional name={alias} context={context} />
                  )}
                </For>
              </Show>
            </>
          }>
          {code`
    target["${property.getNameAsString()}"] = newValue;
    return true;
`}
        </IfStatement>
      ) : (
        <ElseIfClause
          condition={
            <>
              <ConfigPropertyConditional
                name={property.getNameAsString()}
                context={context}
              />
              <Show
                when={property.getAlias() && property.getAlias().length > 0}>
                {code` || `}
                <For each={property.getAlias()} joiner={code` || `}>
                  {alias => (
                    <ConfigPropertyConditional name={alias} context={context} />
                  )}
                </For>
              </Show>
            </>
          }>
          {code`
    target["${property.getNameAsString()}"] = newValue;
    return true;
`}
        </ElseIfClause>
      )}
    </>
  );
}

export interface EnvBuiltinProps extends Omit<BuiltinFileProps, "id"> {
  defaultConfig?: Children;
}

const createEnvRefkey = refkey("createEnv");
const envRefkey = refkey("env");
const envSerializerRefkey = refkey("EnvSerializer");

/**
 * Generates the environment configuration module for the Storm Stack project.
 */
export function EnvBuiltin(props: EnvBuiltinProps) {
  const [{ defaultConfig }, rest] = splitProps(props, ["defaultConfig"]);

  const context = useStorm<EnvPluginContext>();

  const reflection = createResource(async () => {
    if (!context?.value) {
      return new ReflectionClass({
        kind: ReflectionKind.objectLiteral,
        description: `The initial environment configuration state for the Storm Stack project.`,
        types: []
      });
    }

    const result = await readEnvTypeReflection(context?.value, "env");
    result.getProperties().forEach(prop => {
      const aliases = prop.getAlias();
      aliases.filter(Boolean).forEach(alias => {
        result.addProperty({
          name: alias,
          optional: prop.isOptional() ? true : undefined,
          readonly: prop.isReadonly() ? true : undefined,
          description: prop.getDescription(),
          visibility: prop.getVisibility(),
          type: prop.getType(),
          default: prop.getDefaultValue(),
          tags: {
            hidden: prop.isHidden(),
            ignore: prop.isIgnored(),
            internal: prop.isInternal(),
            alias: prop
              .getAlias()
              .filter(a => a !== alias)
              .concat(prop.name),
            title: prop.getTitle() || titleCase(prop.name),
            readonly: prop.isReadonly(),
            permission: prop.getPermission(),
            domain: prop.getDomain()
          }
        });
      });
    });

    return result;
  });

  const envInstance = computed(() => {
    const result = new ReflectionClass(
      {
        kind: ReflectionKind.objectLiteral,
        description: `The initial environment configuration state for the ${titleCase(
          context?.value?.options?.name
        )} project.`,
        types: []
      },
      reflection.data ?? undefined
    );
    result.name = "initialEnv";

    return result;
  });

  const defaultValue = computed(
    () => context && loadEnvFromContext(context.value, process.env)
  );

  const reflectionGetProperties = computed(
    () =>
      reflection.data
        ?.getProperties()
        .filter(property => !property.isIgnored())
        .sort((a, b) =>
          a.getNameAsString().localeCompare(b.getNameAsString())
        ) ?? []
  );

  const reflectionSetProperties = computed(
    () =>
      reflection.data
        ?.getProperties()
        .filter(property => !property.isIgnored() && !property.isReadonly())
        .sort((a, b) =>
          a.getNameAsString().localeCompare(b.getNameAsString())
        ) ?? []
  );

  return (
    <BuiltinFile
      {...rest}
      id="env"
      description="The Storm Stack environment configuration module provides an interface to define environment configuration parameters."
      imports={defu(
        {
          "@storm-stack/core/deepkit/type": [
            "Type",
            "stringify",
            "serializer",
            "serializeFunction",
            "deserializeFunction",
            "ReflectionKind",
            "TemplateState",
            "Serializer",
            "TypeProperty",
            "TypePropertySignature"
          ],
          "@storm-stack/core/runtime-types/shared/env": [
            { name: "StormEnvInterface" }
          ]
        },
        rest.imports ?? {}
      )}>
      <Show when={!isNull(reflection.data)}>
        <EnvTypeDefinition
          defaultValue={defaultValue.value}
          reflection={reflection.data!}
        />
        <hbr />
        <hbr />
      </Show>

      <TypescriptObject
        name="initialEnv"
        type="Partial<StormEnvInterface>"
        defaultValue={defaultValue.value}
        reflection={envInstance.value}
        export={true}
        const={true}
      />
      <hbr />
      <hbr />

      <TSDoc heading="The environment configuration serializer for the Storm Stack application.">
        <TSDocLink>
          {`https://deepkit.io/docs/serialization/serializers`}
        </TSDocLink>
        <TSDocLink>
          {`https://github.com/marcj/untitled-code/blob/master/packages/type/src/serializer.ts#L1918`}
        </TSDocLink>
        <TSDocRemarks>
          {`This serializer is used to serialize and deserialize the Storm Stack environment configuration.`}
        </TSDocRemarks>
      </TSDoc>
      <ClassDeclaration
        refkey={envSerializerRefkey}
        name="EnvSerializer"
        extends="Serializer"
        export={true}>
        <ClassMethod name="constructor" public={true}>
          {code`
    super("env");

    this.deserializeRegistry.register(
      ReflectionKind.boolean,
      (type: Type, state: TemplateState) => {
        state.addSetter(
          \`typeof \${state.accessor.toString()} !== "boolean" ? \${state.accessor.toString()} === 1 || \${state.accessor.toString()} === "1" || \${state.accessor.toString()}.toLowerCase() === "t" || \${state.accessor.toString()}.toLowerCase() === "true" || \${state.accessor.toString()}.toLowerCase() === "y" || \${state.accessor.toString()}.toLowerCase() === "yes" : \${state.accessor.toString()}\`
        );
      }
    );
`}
        </ClassMethod>
      </ClassDeclaration>
      <hbr />
      <hbr />

      <TSDoc heading="A {@link EnvSerializer | environment configuration serializer} instance for the Storm Stack application.">
        <TSDocLink>
          {`https://deepkit.io/docs/serialization/serializers`}
        </TSDocLink>
        <TSDocLink>
          {`https://github.com/marcj/untitled-code/blob/master/packages/type/src/serializer.ts#L1918`}
        </TSDocLink>
        <TSDocRemarks>
          {`This serializer is used to serialize and deserialize the Storm Stack environment configuration.`}
        </TSDocRemarks>
      </TSDoc>
      <VarDeclaration
        name="envSerializer"
        export={false}
        const={true}
        initializer={<NewExpression args={[]} target={"EnvSerializer"} />}
      />
      <hbr />
      <hbr />

      <TSDoc heading="Serialize a environment configuration object to JSON data objects (not a JSON string).">
        <TSDocRemarks>
          {`The resulting JSON object can be stringified using JSON.stringify().`}
        </TSDocRemarks>
        <TSDocExample>{`const json = serializeEnv(env);`}</TSDocExample>
        <TSDocThrows>
          {`ValidationError when serialization or validation fails.`}
        </TSDocThrows>
      </TSDoc>
      <VarDeclaration
        name="serializeEnv"
        export={true}
        const={true}
        initializer={"serializeFunction<StormEnvBase>(envSerializer)"}
      />
      <hbr />
      <hbr />

      <TSDoc heading="Deserialize a environment configuration object from JSON data objects to JavaScript objects, without running any validators.">
        <TSDocRemarks>
          {`Types that are already correct will be used as-is.`}
        </TSDocRemarks>
        <TSDocExample>{`const env = deserializeEnv(json);`}</TSDocExample>
        <TSDocThrows>
          {`ValidationError when deserialization fails.`}
        </TSDocThrows>
      </TSDoc>
      <VarDeclaration
        name="deserializeEnv"
        export={true}
        const={true}
        initializer={"deserializeFunction<StormEnvBase>(envSerializer)"}
      />
      <hbr />
      <hbr />

      <TSDoc heading="Initializes the Storm Stack environment configuration module.">
        <TSDocRemarks>
          {`This function initializes the Storm Stack environment configuration object.`}
        </TSDocRemarks>
        <TSDocParam name="environmentConfig">
          {`The dynamic/runtime configuration - this could include the current environment variables or any other environment-specific settings provided by the runtime.`}
        </TSDocParam>
        <TSDocReturns>
          {`The initialized Storm Stack configuration object.`}
        </TSDocReturns>
      </TSDoc>
      <Show when={Boolean(context?.value?.entryPath)}>
        <FunctionDeclaration
          refkey={createEnvRefkey}
          async={false}
          export={true}
          name="createEnv"
          parameters={[
            {
              name: "environmentConfig",
              type: `Partial<StormEnv>`,
              optional: false,
              default: "{}"
            }
          ]}
          returnType="StormEnv">
          {code`
  return new Proxy<StormEnv>(
    deserializeEnv({
      ...initialEnv,
      ...environmentConfig
    }) as StormEnv,
    {
      get: (target: StormEnvBase, propertyName: string) => { `}
          <hbr />

          <For each={reflectionGetProperties}>
            {(property: ReflectionProperty, index: number) => (
              <ConfigPropertyGet
                index={index}
                context={context?.value}
                property={property}
              />
            )}
          </For>
          {code`
            return undefined;
          }, `}

          <hbr />
          <hbr />
          {code` set: (target: StormEnvBase, propertyName: string, newValue: any) => { `}
          <hbr />

          <For each={reflectionSetProperties} ender={code` else `}>
            {(property: ReflectionProperty, index: number) => (
              <ConfigPropertySet
                index={index}
                context={context?.value}
                property={property}
              />
            )}
          </For>

          <hbr />
          {code`return false;
      }
    }
  );
`}
        </FunctionDeclaration>
      </Show>
      <hbr />
      <hbr />
      <hbr />

      <VarDeclaration
        refkey={envRefkey}
        name="env"
        type="StormEnv"
        export={true}
        const={true}
        initializer={
          <>
            {code`createEnv(`}
            {defaultConfig || "{}"}
            {code` as Partial<StormEnv>)`}
          </>
        }
      />
    </BuiltinFile>
  );
}
