/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

/* eslint-disable @typescript-eslint/ban-types */

import { NativeClass } from "../utility-types/base";
import { isPlainObject } from "./is-plain-object";

// Prepare
const isClassRegex = /^class\s|^function\s+[A-Z]/;
const isConventionalClassRegex = /^function\s+[A-Z]/;
const isNativeClassRegex = /^class\s/;

/** Is ES6+ class */
export function isNativeClass(value?: any): value is NativeClass {
  // NOTE TO DEVELOPER: If any of this changes, isClass must also be updated
  return (
    typeof value === "function" && isNativeClassRegex.test(value.toString())
  );
}

/**
 * Check if the provided value's type is a conventional class
 *
 * @remarks
 * Is Conventional Class
 * Looks for function with capital first letter MyClass
 * First letter is the 9th character
 * If changed, isClass must also be updated
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is a conventional class
 */
export function isConventionalClass(value?: any): value is Function {
  return (
    typeof value === "function" &&
    isConventionalClassRegex.test(value.toString())
  );
}

/**
 * Check if the provided value's type is `Object`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `Object`
 */
export function isClass(value?: any): value is Function | NativeClass; // only guarantee of truth type, not of validity
export function isClass(value?: any): boolean {
  return typeof value === "function" && isClassRegex.test(value.toString());
}

/**
 * Check if the provided value's type is `Object`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `Object`
 */
export const isObject = (value: unknown): value is object => {
  try {
    return (
      typeof value === "object" ||
      (Boolean(value) && value?.constructor === Object) ||
      isPlainObject(value)
    );
  } catch {
    return false;
  }
};
