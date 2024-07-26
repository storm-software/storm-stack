import { isPlainObject } from "@storm-stack/types";

/**
 * Flattens a nested object into a single level object with dot-separated keys.
 *
 * @example
 * ```typescript
 * const nestedObject = {
 *   a: {
 *     b: {
 *       c: 1
 *     }
 *   },
 *   d: [2, 3]
 * };
 *
 * const flattened = flattenObject(nestedObject);
 * console.log(flattened);
 * // Output:
 * // {
 * //   'a.b.c': 1,
 * //   'd.0': 2,
 * //   'd.1': 3
 * // }
 * ```
 *
 * @param object - The object to flatten.
 * @returns - The flattened object.
 */
export function flattenObject(object: object): Record<string, any> {
  return flattenObjectImpl(object);
}

function flattenObjectImpl(object: object, prefix = ""): Record<string, any> {
  const result: Record<string, any> = {};
  const keys = Object.keys(object);

  for (const key of keys) {
    const value = (object as any)[key];

    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value) && Object.keys(value).length > 0) {
      Object.assign(result, flattenObjectImpl(value, prefixedKey));
      continue;
    }

    if (Array.isArray(value)) {
      for (const [index, element_] of value.entries()) {
        result[`${prefixedKey}.${index}`] = element_;
      }
      continue;
    }

    result[prefixedKey] = value;
  }

  return result;
}
