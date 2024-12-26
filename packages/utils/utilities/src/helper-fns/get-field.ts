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

/* eslint-disable no-param-reassign */

import { isDeepKey, isNumber, toStringKey } from "@storm-stack/types";
import { toPath } from "./to-path";

/**
 * See the definition of `@types/lodash`.
 */
type GetIndexedField<T, K> = K extends keyof T
  ? T[K]
  : K extends `${number}`
    ? "length" extends keyof T
      ? number extends T["length"]
        ? number extends keyof T
          ? T[number]
          : undefined
        : undefined
      : undefined
    : undefined;

type FieldWithPossiblyUndefined<T, Key> =
  | GetField<Exclude<T, undefined>, Key>
  | Extract<T, undefined>;

type IndexedFieldWithPossiblyUndefined<T, Key> =
  | GetIndexedField<Exclude<T, undefined>, Key>
  | Extract<T, undefined>;

export type GetField<T, P> = P extends `${infer Left}.${infer Right}`
  ? Left extends keyof Exclude<T, undefined>
    ?
        | FieldWithPossiblyUndefined<Exclude<T, undefined>[Left], Right>
        | Extract<T, undefined>
    : Left extends `${infer FieldKey}[${infer IndexKey}]`
      ? FieldKey extends keyof T
        ? FieldWithPossiblyUndefined<
            IndexedFieldWithPossiblyUndefined<T[FieldKey], IndexKey>,
            Right
          >
        : undefined
      : undefined
  : P extends keyof T
    ? T[P]
    : P extends `${infer FieldKey}[${infer IndexKey}]`
      ? FieldKey extends keyof T
        ? IndexedFieldWithPossiblyUndefined<T[FieldKey], IndexKey>
        : undefined
      : IndexedFieldWithPossiblyUndefined<T, P>;

/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template K - The type of the key in the object.
 * @template D - The type of the default value.
 *
 * @param {T} object - The object to query.
 * @param {K | [K]} path - The path of the property to get.
 * @returns {T[K]} - Returns the resolved value.
 */
export function getField<T extends object, K extends keyof T>(
  object: T,
  path: K | readonly [K]
): T[K];
/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template K - The type of the key in the object.
 *
 * @param {T | null | undefined} object - The object to query.
 * @param {K | [K]} path - The path of the property to get.
 * @returns {T[K] | undefined} - Returns the resolved value.
 */
export function getField<T extends object, K extends keyof T>(
  object: T | null | undefined,
  path: K | readonly [K]
): T[K] | undefined;
/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template K - The type of the key in the object.
 * @template D - The type of the default value.
 *
 * @param {T | null | undefined} object - The object to query.
 * @param {K | [K]} path - The path of the property to get.
 * @param {D} defaultValue - The value returned if the resolved value is undefined.
 * @returns {Exclude<T[K], undefined> | D} - Returns the resolved value.
 */
export function getField<T extends object, K extends keyof T, D>(
  object: T | null | undefined,
  path: K | readonly [K],
  defaultValue: D
): Exclude<T[K], undefined> | D;
/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template K1 - The type of the first key in the object.
 * @template K2 - The type of the second key in the object.
 *
 * @param {T} object - The object to query.
 * @param {[K1, K2]} path - The path of the property to get.
 * @returns {T[K1][K2]} - Returns the resolved value.
 */
export function getField<
  T extends object,
  K1 extends keyof T,
  K2 extends keyof T[K1]
>(object: T, path: readonly [K1, K2]): T[K1][K2];
/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template K1 - The type of the first key in the object.
 * @template K2 - The type of the second key in the object.
 *
 * @param {T | null | undefined} object - The object to query.
 * @param {[K1, K2]} path - The path of the property to get.
 * @returns {T[K1][K2] | undefined} - Returns the resolved value.
 */
export function getField<
  T extends object,
  K1 extends keyof T,
  K2 extends keyof T[K1]
>(object: T | null | undefined, path: readonly [K1, K2]): T[K1][K2] | undefined;
/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template K1 - The type of the first key in the object.
 * @template K2 - The type of the second key in the object.
 * @template D - The type of the default value.
 *
 * @param {T | null | undefined} object - The object to query.
 * @param {[K1, K2]} path - The path of the property to get.
 * @param {D} defaultValue - The value returned if the resolved value is undefined.
 * @returns {Exclude<T[K1][K2], undefined> | D} - Returns the resolved value.
 */
export function getField<
  T extends object,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  D
>(
  object: T | null | undefined,
  path: readonly [K1, K2],
  defaultValue: D
): Exclude<T[K1][K2], undefined> | D;
/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template K1 - The type of the first key in the object.
 * @template K2 - The type of the second key in the object.
 * @template K3 - The type of the third key in the object.
 *
 * @param {T} object - The object to query.
 * @param {[K1, K2, K3]} path - The path of the property to get.
 * @returns {T[K1][K2][K3]} - Returns the resolved value.
 */
export function getField<
  T extends object,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2]
>(object: T, path: readonly [K1, K2, K3]): T[K1][K2][K3];
/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template K1 - The type of the first key in the object.
 * @template K2 - The type of the second key in the object.
 * @template K3 - The type of the third key in the object.
 *
 * @param {T | null | undefined} object - The object to query.
 * @param {[K1, K2, K3]} path - The path of the property to get.
 * @returns {T[K1][K2][K3] | undefined} - Returns the resolved value.
 */
export function getField<
  T extends object,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2]
>(
  object: T | null | undefined,
  path: readonly [K1, K2, K3]
): T[K1][K2][K3] | undefined;
/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template K1 - The type of the first key in the object.
 * @template K2 - The type of the second key in the object.
 * @template K3 - The type of the third key in the object.
 * @template D - The type of the default value.
 *
 * @param {T | null | undefined} object - The object to query.
 * @param {[K1, K2, K3]} path - The path of the property to get.
 * @param {D} defaultValue - The value returned if the resolved value is undefined.
 * @returns {Exclude<T[K1][K2][K3], undefined> | D} - Returns the resolved value.
 */
export function getField<
  T extends object,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  D
>(
  object: T | null | undefined,
  path: readonly [K1, K2, K3],
  defaultValue: D
): Exclude<T[K1][K2][K3], undefined> | D;
/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template K1 - The type of the first key in the object.
 * @template K2 - The type of the second key in the object.
 * @template K3 - The type of the third key in the object.
 * @template K4 - The type of the fourth key in the object.
 *
 * @param {T} object - The object to query.
 * @param {[K1, K2, K3, K4]} path - The path of the property to get.
 * @returns {T[K1][K2][K3][K4]} - Returns the resolved value.
 */
export function getField<
  T extends object,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3]
>(object: T, path: readonly [K1, K2, K3, K4]): T[K1][K2][K3][K4];
/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template K1 - The type of the first key in the object.
 * @template K2 - The type of the second key in the object.
 * @template K3 - The type of the third key in the object.
 * @template K4 - The type of the fourth key in the object.
 *
 * @param {T | null | undefined} object - The object to query.
 * @param {[K1, K2, K3, K4]} path - The path of the property to get.
 * @returns {T[K1][K2][K3][K4] | undefined} - Returns the resolved value.
 */
export function getField<
  T extends object,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3]
>(
  object: T | null | undefined,
  path: readonly [K1, K2, K3, K4]
): T[K1][K2][K3][K4] | undefined;
/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template K1 - The type of the first key in the object.
 * @template K2 - The type of the second key in the object.
 * @template K3 - The type of the third key in the object.
 * @template K4 - The type of the fourth key in the object.
 * @template D - The type of the default value.
 *
 * @param {T | null | undefined} object - The object to query.
 * @param {[K1, K2, K3, K4]} path - The path of the property to get.
 * @param {D} defaultValue - The value returned if the resolved value is undefined.
 * @returns {Exclude<T[K1][K2][K3][K4], undefined> | D} - Returns the resolved value.
 */
export function getField<
  T extends object,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
  D
>(
  object: T | null | undefined,
  path: readonly [K1, K2, K3, K4],
  defaultValue: D
): Exclude<T[K1][K2][K3][K4], undefined> | D;
/**
 * Retrieves the value at a given path from an object with numeric keys. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the value.
 *
 * @param {Record<number, T>} object - The object to query.
 * @param {number} path - The path of the property to get.
 * @returns {T} - Returns the resolved value.
 */
export function getField<T>(object: Record<number, T>, path: number): T;
/**
 * Retrieves the value at a given path from an object with numeric keys. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the value.
 *
 * @param {Record<number, T> | null | undefined} object - The object to query.
 * @param {number} path - The path of the property to get.
 * @returns {T | undefined} - Returns the resolved value.
 */
export function getField<T>(
  object: Record<number, T> | null | undefined,
  path: number
): T | undefined;
/**
 * Retrieves the value at a given path from an object with numeric keys. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the value.
 * @template D - The type of the default value.
 *
 * @param {Record<number, T> | null | undefined} object - The object to query.
 * @param {number} path - The path of the property to get.
 * @param {D} defaultValue - The value returned if the resolved value is undefined.
 * @returns {T | D} - Returns the resolved value.
 */
export function getField<T, D>(
  object: Record<number, T> | null | undefined,
  path: number,
  defaultValue: D
): T | D;
/**
 * Retrieves the value at a given path from a null or undefined object, returning the default value.
 *
 * @template D - The type of the default value.
 *
 * @param {null | undefined} object - The object to query.
 * @param {PropertyKey} path - The path of the property to get.
 * @param {D} defaultValue - The value returned if the resolved value is undefined.
 * @returns {D} - Returns the default value.
 */
export function getField<D>(
  object: null | undefined,
  path: PropertyKey,
  defaultValue: D
): D;
/**
 * Retrieves the value at a given path from a null or undefined object, returning undefined.
 *
 * @param {null | undefined} object - The object to query.
 * @param {PropertyKey} path - The path of the property to get.
 * @returns {undefined} - Returns undefined.
 */
export function getField(
  object: null | undefined,
  path: PropertyKey
): undefined;
/**
 * Retrieves the value at a given path from a string-keyed object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template P - The type of the path.
 *
 * @param {T} data - The object to query.
 * @param {P} path - The path of the property to get.
 * @returns {string extends P ? any : GetField<T, P>} - Returns the resolved value.
 */
export function getField<T, P extends string>(
  data: T,
  path: P
): string extends P ? any : GetField<T, P>;
/**
 * Retrieves the value at a given path from a string-keyed object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @template T - The type of the object.
 * @template P - The type of the path.
 * @template D - The type of the default value.
 *
 * @param {T} data - The object to query.
 * @param {P} path - The path of the property to get.
 * @param {D} defaultValue - The value returned if the resolved value is undefined.
 * @returns {Exclude<GetField<T, P>, null | undefined> | D} - Returns the resolved value.
 */
export function getField<T, P extends string, D = GetField<T, P>>(
  data: T,
  path: P,
  defaultValue: D
): Exclude<GetField<T, P>, null | undefined> | D;
/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @param {unknown} object - The object to query.
 * @param {PropertyKey | readonly PropertyKey[]} path - The path of the property to get.
 * @param {unknown} [defaultValue] - The value returned if the resolved value is undefined.
 * @returns {any} - Returns the resolved value.
 */
export function getField(
  object: unknown,
  path: PropertyKey | readonly PropertyKey[],
  defaultValue?: unknown
): any;
/**
 * Retrieves the value at a given path from an object. If the resolved value is undefined, the defaultValue is returned instead.
 *
 * @param {unknown} object - The object to query.
 * @param {PropertyKey | readonly PropertyKey[]} path - The path of the property to get.
 * @param {unknown} [defaultValue] - The value returned if the resolved value is undefined.
 * @returns {any} - Returns the resolved value.
 */
export function getField(
  object: any,
  path: PropertyKey | readonly PropertyKey[],
  defaultValue?: any
): any {
  if (object === null) {
    return defaultValue;
  }

  switch (typeof path) {
    case "string": {
      const result = object[path];

      if (result === undefined) {
        if (isDeepKey(path)) {
          return getField(object, toPath(path), defaultValue);
        }
        return defaultValue;
      }

      return result;
    }
    case "number":
    case "symbol": {
      if (isNumber(path)) {
        path = toStringKey(path);
      }

      const result = Array.isArray(path)
        ? undefined
        : object[path as PropertyKey];
      if (result === undefined) {
        return defaultValue;
      }

      return result;
    }
    default: {
      if (Array.isArray(path)) {
        return getWithPath(object, path, defaultValue);
      }

      path = Object.is(path?.valueOf(), -0) ? "-0" : String(path);

      const result = object[path];

      if (result === undefined) {
        return defaultValue;
      }

      return result;
    }
  }
}

function getWithPath(
  object: any,
  path: readonly PropertyKey[],
  defaultValue?: any
): any {
  if (path.length === 0) {
    return defaultValue;
  }

  let current = object;

  for (const element_ of path) {
    if (current === null) {
      return defaultValue;
    }

    current = current[element_];
  }

  if (current === undefined) {
    return defaultValue;
  }

  return current;
}
