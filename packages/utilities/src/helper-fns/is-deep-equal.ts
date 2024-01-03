import { isSet, isSetString } from "../type-checks";

const hasElementType = typeof Element !== "undefined";
const hasMap = typeof Map === "function";
const hasSet = typeof Set === "function";
const hasArrayBuffer =
  typeof ArrayBuffer === "function" && !!ArrayBuffer.isView;

function equal(a: any, b: any) {
  if (a === b) return true;

  if (a && b && typeof a == "object" && typeof b == "object") {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;
      return true;
    }

    // 1. Extra `has<Type> &&` helpers in initial condition allow es6 code
    //    to co-exist with es5.
    // 2. Replace `for of` with es5 compliant iteration using `for`.
    //    Basically, take:
    //
    //    ```js
    //    for (i of a.entries())
    //      if (!b.has(i[0])) return false;
    //    ```
    //
    //    ... and convert to:
    //
    //    ```js
    //    it = a.entries();
    //    while (!(i = it.next()).done)
    //      if (!b.has(i.value[0])) return false;
    //    ```
    //
    //    **Note**: `i` access switches to `i.value`.
    var it;
    if (hasMap && a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      it = a.entries();
      while (!(i = it.next()).done) if (!b.has(i.value[0])) return false;
      it = a.entries();
      while (!(i = it.next()).done)
        if (!equal(i.value[1], b.get(i.value[0]))) return false;
      return true;
    }

    if (hasSet && a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      it = a.entries();
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
      if (length != b.length) return false;
      for (i = length; i-- !== 0; ) if (a[i] !== b[i]) return false;
      return true;
    }

    if (a.constructor === RegExp)
      return a.source === b.source && a.flags === b.flags;

    if (
      a.valueOf !== Object.prototype.valueOf &&
      typeof a.valueOf === "function" &&
      typeof b.valueOf === "function"
    )
      return a.valueOf() === b.valueOf();
    if (
      a.toString !== Object.prototype.toString &&
      typeof a.toString === "function" &&
      typeof b.toString === "function"
    )
      return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0; )
      if (
        !isSet(i) ||
        !isSetString(keys[i]) ||
        !Object.prototype.hasOwnProperty.call(b, keys[i]!)
      )
        return false;

    if (hasElementType && a instanceof Element) return false;

    for (i = length; i-- !== 0; ) {
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
        !equal(a[keys[i]!], b[keys[i]!])
      )
        return false;
    }

    return true;
  }

  return a !== a && b !== b;
}

export function isEqual(a: any, b: any) {
  try {
    return equal(a, b);
  } catch (error) {
    if (((error as any)?.message || "").match(/stack|recursion/i)) {
      console.warn("isEqual cannot handle circular refs");
      return false;
    }

    throw error;
  }
}
