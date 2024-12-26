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

import { isPrimitive, isTypedArray } from "@storm-stack/types";

/**
 * Creates a deep clone of the given object.
 *
 * @param obj - The object to clone.
 * @returns A deep clone of the given object.
 *
 * @example
 * ```typescript
 * // Clone a primitive values
 * const num = 29;
 * const clonedNum = clone(num);
 * console.log(clonedNum); // 29
 * console.log(clonedNum === num) ; // true
 *
 * // Clone an array
 * const arr = [1, 2, 3];
 * const clonedArr = clone(arr);
 * console.log(clonedArr); // [1, 2, 3]
 * console.log(clonedArr === arr); // false
 *
 * // Clone an array with nested objects
 * const arr = [1, { a: 1 }, [1, 2, 3]];
 * const clonedArr = clone(arr);
 * arr[1].a = 2;
 * console.log(arr); // [2, { a: 2 }, [1, 2, 3]]
 * console.log(clonedArr); // [1, { a: 1 }, [1, 2, 3]]
 * console.log(clonedArr === arr); // false
 *
 * // Clone an object
 * const obj = { a: 1, b: 'es-toolkit', c: [1, 2, 3] };
 * const clonedObj = clone(obj);
 * console.log(clonedObj); // { a: 1, b: 'es-toolkit', c: [1, 2, 3] }
 * console.log(clonedObj === obj); // false
 *
 *
 * // Clone an object with nested objects
 * const obj = { a: 1, b: { c: 1 } };
 * const clonedObj = clone(obj);
 * obj.b.c = 2;
 * console.log(obj); // { a: 1, b: { c: 2 } }
 * console.log(clonedObj); // { a: 1, b: { c: 1 } }
 * console.log(clonedObj === obj); // false
 * ```
 */
export function deepClone<T>(obj: T): Resolved<T> {
  if (isPrimitive(obj)) {
    return obj as Resolved<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as Resolved<T>;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as Resolved<T>;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as Resolved<T>;
  }

  if (obj instanceof Map) {
    const result = new Map();
    for (const [key, value] of obj.entries()) {
      result.set(key, deepClone(value));
    }
    return result as Resolved<T>;
  }

  if (obj instanceof Set) {
    const result = new Set();
    for (const value of obj.values()) {
      result.add(deepClone(value));
    }
    return result as Resolved<T>;
  }

  if (isTypedArray(obj)) {
    const result = new (Object.getPrototypeOf(obj).constructor)(obj.length);
    for (const [i, element_] of obj.entries()) {
      result[i] = deepClone(element_);
    }
    return result as Resolved<T>;
  }

  if (
    obj instanceof ArrayBuffer ||
    (typeof SharedArrayBuffer !== "undefined" &&
      obj instanceof SharedArrayBuffer)
  ) {
    return [...(obj as any)] as Resolved<T>;
  }

  if (obj instanceof DataView) {
    const result = new DataView([...(obj.buffer as any)] as any);
    cloneDeepHelper(obj, result);
    return result as Resolved<T>;
  }

  // For legacy NodeJS support
  if (typeof File !== "undefined" && obj instanceof File) {
    const result = new File([obj], obj.name, { type: obj.type });
    cloneDeepHelper(obj, result);
    return result as Resolved<T>;
  }

  if (obj instanceof Blob) {
    const result = new Blob([obj], { type: obj.type });
    cloneDeepHelper(obj, result);
    return result as Resolved<T>;
  }

  if (obj instanceof Error) {
    const result = new (obj.constructor as new () => Error)();
    result.message = obj.message;
    result.name = obj.name;
    result.stack = obj.stack;
    result.cause = obj.cause;
    cloneDeepHelper(obj, result);
    return result as Resolved<T>;
  }

  if (typeof obj === "object" && obj !== null) {
    const result = {};
    cloneDeepHelper(obj, result);
    return result as Resolved<T>;
  }

  return obj as Resolved<T>;
}

// eslint-disable-next-line
function cloneDeepHelper(obj: any, clonedObj: any): void {
  const keys = Object.keys(obj);

  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);

    if (descriptor?.writable || descriptor?.set) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
}

export type Resolved<T> =
  Equal<T, ResolvedMain<T>> extends true ? T : ResolvedMain<T>;

type Equal<X, Y> = X extends Y ? (Y extends X ? true : false) : false;

type ResolvedMain<T> = T extends [never]
  ? never // (special trick for jsonable | null) type
  : ValueOf<T> extends boolean | number | bigint | string
    ? ValueOf<T>
    : T extends (...args: any[]) => any
      ? never
      : T extends object
        ? ResolvedObject<T>
        : ValueOf<T>;

type ResolvedObject<T extends object> = T extends (infer U)[]
  ? IsTuple<T> extends true
    ? ResolvedTuple<T>
    : ResolvedMain<U>[]
  : T extends Set<infer U>
    ? Set<ResolvedMain<U>>
    : T extends Map<infer K, infer V>
      ? Map<ResolvedMain<K>, ResolvedMain<V>>
      : T extends WeakSet<any> | WeakMap<any, any>
        ? never
        : T extends
              | Date
              | Uint8Array
              | Uint8ClampedArray
              | Uint16Array
              | Uint32Array
              | BigUint64Array
              | Int8Array
              | Int16Array
              | Int32Array
              | BigInt64Array
              | Float32Array
              | Float64Array
              | ArrayBuffer
              | SharedArrayBuffer
              | DataView
              | Blob
              | File
          ? T
          : {
              [P in keyof T]: ResolvedMain<T[P]>;
            };

type ResolvedTuple<T extends readonly any[]> = T extends []
  ? []
  : T extends [infer F]
    ? [ResolvedMain<F>]
    : T extends [infer F, ...infer Rest extends readonly any[]]
      ? [ResolvedMain<F>, ...ResolvedTuple<Rest>]
      : T extends [(infer F)?]
        ? [ResolvedMain<F>?]
        : T extends [(infer F)?, ...infer Rest extends readonly any[]]
          ? [ResolvedMain<F>?, ...ResolvedTuple<Rest>]
          : [];

type IsTuple<T extends readonly any[] | { length: number }> = [T] extends [
  never
]
  ? false
  : T extends readonly any[]
    ? number extends T["length"]
      ? false
      : true
    : false;

type ValueOf<Instance> =
  IsValueOf<Instance, boolean> extends true
    ? boolean
    : IsValueOf<Instance, number> extends true
      ? number
      : IsValueOf<Instance, string> extends true
        ? string
        : Instance;

type IsValueOf<Instance, O extends IValueOf<any>> = Instance extends O
  ? O extends IValueOf<infer Primitive>
    ? Instance extends Primitive
      ? false
      : true // not Primitive, but Object
    : false // cannot be
  : false;

interface IValueOf<T> {
  valueOf(): T;
}
