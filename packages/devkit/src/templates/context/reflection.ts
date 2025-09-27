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

import type { ComponentContext } from "@alloy-js/core";
import { createContext, createNamedContext, useContext } from "@alloy-js/core";
import {
  ReflectionClass,
  ReflectionMethod,
  ReflectionParameter,
  ReflectionProperty
} from "@storm-stack/core/deepkit/type";
import { ReflectionOverrideInterface } from "../../types/templates";

export interface ReflectionClassContextInterface<
  T extends Record<string, any> = Record<string, any>
> {
  reflection: ReflectionClass<T>;
  override?: ReflectionOverrideInterface<T>;
}

/**
 * The reflection class context used in template rendering.
 */
export const ReflectionClassContext: ComponentContext<
  ReflectionClassContextInterface<any>
> = createContext<ReflectionClassContextInterface<any>>();

/**
 * Hook to access the Reflection context.
 *
 * @returns A reactive version of the current reflection.
 */
export function useReflectionClass<
  T extends Record<string, any> = Record<string, any>
>() {
  const context = useContext<ReflectionClassContextInterface<T>>(
    ReflectionClassContext
  )!;

  if (!context) {
    throw new Error(
      "Storm Stack - ReflectionClass Context is not set. Make sure this component is wrapped in a `Output` component or being rendered by the `RenderPlugin` from `@storm-stack/devkit`."
    );
  }

  return context;
}

/**
 * The reflection property context used in template rendering.
 */
export const ReflectionPropertyContext: ComponentContext<ReflectionProperty> =
  createNamedContext<ReflectionProperty>("reflection-property");

/**
 * Hook to access the Reflection Property context.
 *
 * @returns A reactive version of the current reflection.
 */
export function useReflectionProperty() {
  const context = useContext<ReflectionProperty>(ReflectionPropertyContext)!;

  if (!context) {
    throw new Error(
      "Storm Stack - Reflection Property Context is not set. Make sure this component is wrapped in a `Output` component or being rendered by the `RenderPlugin` from `@storm-stack/devkit`."
    );
  }

  return context;
}

/**
 * The reflection method context used in template rendering.
 */
export const ReflectionMethodContext: ComponentContext<ReflectionMethod> =
  createNamedContext<ReflectionMethod>("reflection-method");

/**
 * Hook to access the Reflection Method context.
 *
 * @returns A reactive version of the current reflection.
 */
export function useReflectionMethod() {
  const context = useContext<ReflectionMethod>(ReflectionMethodContext)!;

  if (!context) {
    throw new Error(
      "Storm Stack - Reflection Method Context is not set. Make sure this component is wrapped in a `Output` component or being rendered by the `RenderPlugin` from `@storm-stack/devkit`."
    );
  }

  return context;
}

/**
 * The reflection parameter context used in template rendering.
 */
export const ReflectionParameterContext: ComponentContext<ReflectionParameter> =
  createNamedContext<ReflectionParameter>("reflection-parameter");

/**
 * Hook to access the Reflection Parameter context.
 *
 * @returns A reactive version of the current reflection.
 */
export function useReflectionParameter() {
  return useContext<ReflectionParameter>(ReflectionParameterContext)!;
}
