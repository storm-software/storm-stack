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

import { code, computed, For, splitProps } from "@alloy-js/core";
import {
  ObjectExpression,
  ObjectProperty,
  VarDeclaration,
  VarDeclarationProps
} from "@alloy-js/typescript";
import {
  ReflectionClass,
  ReflectionProperty
} from "@storm-stack/core/deepkit/type";
import { camelCase } from "@stryke/string-format/camel-case";
import { pascalCase } from "@stryke/string-format/pascal-case";
import { isUndefined } from "@stryke/type-checks/is-undefined";
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
  reflection: ReflectionClass<T>;
  defaultValue?: Partial<T>;
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
  const [{ name, type, reflection, defaultValue }, rest] = splitProps(props, [
    "name",
    "type",
    "reflection",
    "defaultValue"
  ]);

  const objectName = computed(() => camelCase(name || reflection.getName()));
  const objectType = computed(() => type || pascalCase(reflection.getName()));
  const properties = computed(() =>
    reflection
      .getProperties()
      .filter(
        item =>
          !item.isIgnored() &&
          !isUndefined(
            defaultValue?.[item.getNameAsString()] ??
              item.getAlias().reduce((ret, alias) => {
                if (
                  isUndefined(ret) &&
                  !isUndefined((defaultValue as Record<string, any>)?.[alias])
                ) {
                  return (defaultValue as Record<string, any>)?.[alias];
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

  return (
    <ReflectionClassContext.Provider
      value={{
        reflection,
        override: {
          name: objectName.value,
          type: objectType.value,
          defaultValue
        }
      }}>
      <TSDocReflectionClass
        heading={code`${objectName.value} object instance`}
      />
      <VarDeclaration
        name={objectName.value}
        type={objectType.value}
        const={true}
        {...rest}>
        <ObjectExpression>
          <For each={properties.value} comma={true} doubleHardline={true}>
            {prop => <TypescriptObjectProperty property={prop} />}
          </For>
        </ObjectExpression>
      </VarDeclaration>
      <hbr />
    </ReflectionClassContext.Provider>
  );
}

/**
 * Generates a TypeScript object property for the given reflection class.
 */
export function TypescriptObjectProperty(props: TypescriptObjectPropertyProps) {
  const [{ property }] = splitProps(props, ["property"]);

  return (
    <ReflectionPropertyContext.Provider value={property}>
      <TSDocReflectionProperty
        heading={`${property.getNameAsString()} object property`}
      />
      <ObjectProperty name={property.getNameAsString()} />
      <hbr />
    </ReflectionPropertyContext.Provider>
  );
}
