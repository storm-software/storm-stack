/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://docs.stormsoftware.com/projects/storm-stack
 Contact:         https://stormsoftware.com/contact
 Licensing:       https://stormsoftware.com/licensing

 -------------------------------------------------------------------*/

import { isSet, isSetString } from "@storm-stack/types";

const hasMap = typeof Map === "function";
const hasSet = typeof Set === "function";
const hasArrayBuffer =
  typeof ArrayBuffer === "function" && Boolean(ArrayBuffer.isView);

function equal(a: any, b: any) {
  if (a === b) return true;

  if (a && b && typeof a === "object" && typeof b === "object") {
    if (a.constructor !== b.constructor) return false;

    let length;
    if (Array.isArray(a)) {
      length = a.length;
      // eslint-disable-next-line eqeqeq
      if (length != b.length) return false;
      for (let i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;
      return true;
    }

    let it;
    if (hasMap && a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      it = a.entries();
      let i;
      while (!(i = it.next()).done) if (!b.has(i.value[0])) return false;
      it = a.entries();
      while (!(i = it.next()).done) {
        if (!equal(i.value[1], b.get(i.value[0]))) return false;
      }
      return true;
    }

    if (hasSet && a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      it = a.entries();
      let i;
      while (!(i = it.next()).done) if (!b.has(i.value[0])) return false;
      return true;
    }

    if (
      Array.isArray(a) &&
      Array.isArray(b) &&
      hasArrayBuffer &&
      ArrayBuffer.isView(a) &&
      ArrayBuffer.isView(b)
    ) {
      length = a.length;
      // eslint-disable-next-line eqeqeq
      if (length != b.length) return false;
      for (let i = length; i-- !== 0; ) if (a[i] !== b[i]) return false;
      return true;
    }

    if (a.constructor === RegExp) {
      return a.source === b.source && a.flags === b.flags;
    }

    if (
      a.valueOf !== Object.prototype.valueOf &&
      typeof a.valueOf === "function" &&
      typeof b.valueOf === "function"
    ) {
      return a.valueOf() === b.valueOf();
    }
    if (
      a.toString !== Object.prototype.toString &&
      typeof a.toString === "function" &&
      typeof b.toString === "function"
    ) {
      return a.toString() === b.toString();
    }

    const keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (let i = length; i-- !== 0; ) {
      if (
        !isSet(i) ||
        !isSetString(keys[i]) ||
        !Object.prototype.hasOwnProperty.call(b, keys[i] as any)
      ) {
        return false;
      }
    }

    for (let i = length; i-- !== 0; ) {
      if (
        Array.isArray(keys) &&
        (keys[i] === "_owner" || keys[i] === "__v" || keys[i] === "__o") &&
        a.$$typeof
      ) {
        continue;
      }

      if (
        !isSet(i) ||
        !isSetString(keys[i]) ||
        !equal(a[keys[i] as any], b[keys[i] as any])
      ) {
        return false;
      }
    }

    return true;
  }

  // eslint-disable-next-line no-self-compare
  return a !== a && b !== b;
}

/**
 * Checks if two values are equal, including support for `Date`, `RegExp`, and deep object comparison.
 *
 * @example
 * ```ts
 * isEqual(1, 1); // true
 * isEqual({ a: 1 }, { a: 1 }); // true
 * isEqual(/abc/g, /abc/g); // true
 * isEqual(new Date('2020-01-01'), new Date('2020-01-01')); // true
 * isEqual([1, 2, 3], [1, 2, 3]); // true
 * isEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }); // true
 * ```
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns `true` if the values are equal, otherwise `false`.
 */
export function isEqual(a: any, b: any): boolean {
  try {
    return equal(a, b);
  } catch (error) {
    if (/stack|recursion/i.test((error as any)?.message || "")) {
      console.warn("isEqual cannot handle circular refs");
      return false;
    }

    throw error;
  }
}
