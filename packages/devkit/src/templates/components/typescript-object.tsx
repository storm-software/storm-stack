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
  computed,
  Declaration as CoreDeclaration,
  createSymbolSlot,
  For,
  Name,
  Show,
  splitProps
} from "@alloy-js/core";
import {
  createValueSymbol,
  ObjectExpression,
  ObjectProperty,
  TSSymbolFlags,
  TypeRefContext,
  useTSNamePolicy,
  VarDeclarationProps
} from "@alloy-js/typescript";
import {
  ReflectionClass,
  ReflectionProperty
} from "@storm-stack/core/deepkit/type";
import { stringifyDefaultValue } from "@storm-stack/core/lib/deepkit/utilities";
import { camelCase } from "@stryke/string-format/camel-case";
import { pascalCase } from "@stryke/string-format/pascal-case";
import { isUndefined } from "@stryke/type-checks/is-undefined";
import { ComputedRef } from "@vue/reactivity";
import { ComponentProps } from "../../types/templates";
import {
  ReflectionClassContext,
  ReflectionPropertyContext
} from "../context/reflection";
import {
  TSDocReflectionClass,
  TSDocReflectionProperty
} from "./tsdoc-reflection";

export interface TypescriptObjectProps<
  T extends Record<string, any> = Record<string, any>
> extends VarDeclarationProps {
  reflection?: ComputedRef<ReflectionClass<T>>;
  defaultValue?: ComputedRef<Partial<T> | undefined>;
}

export interface TypescriptObjectPropertyProps extends ComponentProps {
  property: ReflectionProperty;
}

/**
 * Generates a TypeScript object for the given reflection class.
 */
export function TypescriptObject<
  T extends Record<string, any> = Record<string, any>
>(props: TypescriptObjectProps<T>) {
  if (!props.reflection?.value) {
    return null;
  }

  const objectName = computed(() =>
    camelCase(props.name || props.reflection!.value.getName())
  );
  const objectType = computed(
    () => props.type || pascalCase(props.reflection!.value.getName())
  );
  const properties = computed(() =>
    props
      .reflection!.value.getProperties()
      .filter(
        item =>
          !item.isIgnored() &&
          !isUndefined(
            props.defaultValue?.value?.[item.getNameAsString()] ??
              item.getAlias().reduce((ret, alias) => {
                if (
                  isUndefined(ret) &&
                  !isUndefined(
                    (props.defaultValue as Record<string, any>)?.value?.[alias]
                  )
                ) {
                  return (props.defaultValue as Record<string, any>)?.value?.[
                    alias
                  ];
                }

                return ret;
              }, undefined) ??
              item.getDefaultValue()
          )
      )
      .sort((a, b) =>
        (a.isReadonly() && b.isReadonly()) ||
        (!a.isReadonly() && !b.isReadonly())
          ? a.getNameAsString().localeCompare(b.getNameAsString())
          : a.isReadonly()
            ? 1
            : -1
      )
  );

  const TypeSymbolSlot = createSymbolSlot();
  const ValueTypeSymbolSlot = createSymbolSlot();
  const sym = createValueSymbol(props.name, {
    refkeys: props.refkey,
    default: props.default,
    export: props.export,
    metadata: props.metadata,
    tsFlags: props.nullish ? TSSymbolFlags.Nullish : TSSymbolFlags.None,
    type: props.type ? TypeSymbolSlot.firstSymbol : undefined,
    namePolicy: useTSNamePolicy().for("variable")
  });

  if (!props.type) {
    ValueTypeSymbolSlot.moveMembersTo(sym);
  }

  const keyword = props.var ? "var" : props.let ? "let" : "const";
  const type = props.type ? (
    <TypeRefContext>
      : <TypeSymbolSlot>{props.type}</TypeSymbolSlot>
    </TypeRefContext>
  ) : undefined;

  return (
    <Show when={!!props.reflection.value}>
      <ReflectionClassContext.Provider
        value={{
          reflection: props.reflection.value as ReflectionClass<any>,
          override: {
            name: objectName.value,
            type: objectType.value,
            defaultValue: props.defaultValue?.value
          }
        }}>
        <Show when={!!objectName.value && !!objectType.value}>
          <TSDocReflectionClass />
          <CoreDeclaration symbol={sym}>
            {props.export ? "export " : ""}
            {props.default ? "default " : ""}
            {keyword} <Name />
            {type} ={" "}
            <ValueTypeSymbolSlot>
              {props.initializer ?? props.children ?? (
                <ObjectExpression>
                  <For
                    each={properties.value ?? []}
                    comma={true}
                    doubleHardline={true}>
                    {prop => <TypescriptObjectProperty property={prop} />}
                  </For>
                </ObjectExpression>
              )}
            </ValueTypeSymbolSlot>
          </CoreDeclaration>
        </Show>
        <hbr />
      </ReflectionClassContext.Provider>
    </Show>
  );
}

/**
 * Generates a TypeScript object property for the given reflection class.
 */
export function TypescriptObjectProperty(props: TypescriptObjectPropertyProps) {
  const [{ property }] = splitProps(props, ["property"]);

  return (
    <ReflectionPropertyContext.Provider value={property}>
      <TSDocReflectionProperty />
      <ObjectProperty
        name={property.getNameAsString()}
        value={stringifyDefaultValue(property)}
      />
      <hbr />
    </ReflectionPropertyContext.Provider>
  );
}
