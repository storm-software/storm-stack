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

import { computed, For, splitProps } from "@alloy-js/core";
import {
  InterfaceDeclaration,
  InterfaceDeclarationProps,
  InterfaceMember,
  InterfaceMemberProps
} from "@alloy-js/typescript";
import {
  ReflectionClass,
  ReflectionProperty,
  stringifyType
} from "@storm-stack/core/deepkit/type";
import { pascalCase } from "@stryke/string-format/pascal-case";
import { ComponentProps } from "../../types/templates";
import {
  ReflectionClassContext,
  ReflectionPropertyContext
} from "../context/reflection";
import {
  TSDocReflectionClass,
  TSDocReflectionProperty
} from "./tsdoc-reflection";

export interface TypeScriptInterfaceProps<
  T extends Record<string, any> = Record<string, any>
> extends InterfaceDeclarationProps,
    ComponentProps {
  reflection: ReflectionClass<T>;
  defaultValue?: Partial<T>;
}

export interface TypescriptInterfacePropertyProps
  extends Omit<InterfaceMemberProps, "name">,
    ComponentProps {
  property: ReflectionProperty;
}

/**
 * Generates a TypeScript interface for the given reflection class.
 */
export function TypeScriptInterface<
  T extends Record<string, any> = Record<string, any>
>(props: TypeScriptInterfaceProps<T>) {
  const [{ name, reflection }, rest] = splitProps(props, [
    "name",
    "reflection"
  ]);

  const interfaceName = computed(() =>
    pascalCase(name || reflection.getName())
  );

  const properties = reflection
    .getProperties()
    .filter(item => !item.isIgnored())
    .sort((a, b) =>
      (a.isReadonly() && b.isReadonly()) || (!a.isReadonly() && !b.isReadonly())
        ? a.getNameAsString().localeCompare(b.getNameAsString())
        : a.isReadonly()
          ? 1
          : -1
    );

  return (
    <ReflectionClassContext.Provider
      value={{
        reflection
      }}>
      <TSDocReflectionClass
        heading={`Interface definition for ${interfaceName.value}`}
      />
      <InterfaceDeclaration export={true} name={interfaceName.value} {...rest}>
        <For each={properties} doubleHardline={true} semicolon={true}>
          {prop => <TypescriptInterfaceProperty property={prop} />}
        </For>
      </InterfaceDeclaration>
    </ReflectionClassContext.Provider>
  );
}

/**
 * Generates a TypeScript interface property for the given reflection class.
 */
export function TypescriptInterfaceProperty(
  props: TypescriptInterfacePropertyProps
) {
  const [{ property }, rest] = splitProps(props, ["property"]);

  return (
    <ReflectionPropertyContext.Provider value={property}>
      <TSDocReflectionProperty
        heading={`Interface property definition for ${property.getNameAsString()}`}
      />
      <InterfaceMember
        name={property.getNameAsString()}
        readonly={property.isReadonly()}
        optional={property.isOptional()}
        nullish={property.isNullable()}
        type={stringifyType(property.getType())}
        {...rest}
      />
    </ReflectionPropertyContext.Provider>
  );
}
