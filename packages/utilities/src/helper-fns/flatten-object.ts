import { periodSplit } from "../string-fns/period-split";
import { isSetObject } from "../type-checks";

/**
 * Flatten an object.
 *
 * @param obj - The object to flatten.
 * @param prefix - The prefix to use.
 * @param keyStringFn - The function to use to convert the key to a string.
 * @returns The flattened object.
 */
export const flattenObject = (
  obj: any,
  prefix = "",
  keyStringFn: (input?: string) => string | undefined = periodSplit
) => {
  const flattened: any = {};

  for (const key of Object.keys(obj)) {
    if (isSetObject(obj[key])) {
      Object.assign(flattened, flattenObject(obj[key], prefix));
    } else {
      const prefixedKey = keyStringFn(`${prefix}_${key}`);
      if (prefixedKey) {
        flattened[prefixedKey] = obj[key];
      }
    }
  }

  return flattened;
};
