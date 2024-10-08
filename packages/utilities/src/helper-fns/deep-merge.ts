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

import {
  isFunction,
  isMergeableObject,
  propertyUnsafe
} from "@storm-stack/types";

const emptyTarget = (val: any) => {
  return Array.isArray(val) ? [] : {};
};

const cloneUnlessOtherwiseSpecified = (value: any, options?: any) => {
  return options.clone !== false && options.isMergeableObject(value)
    ? deepMerge(emptyTarget(value), value, options)
    : value;
};

const defaultArrayMerge = (target: any[], source: any[], options?: any) => {
  return [...target, ...source].map(element => {
    return cloneUnlessOtherwiseSpecified(element, options);
  });
};

const getMergeFunction = (key: string, options?: any) => {
  if (!options.customMerge) {
    return deepMerge;
  }
  const customMerge = options.customMerge(key);
  return isFunction(customMerge) ? customMerge : deepMerge;
};

const getKeys = (target: Record<string, any>) => {
  return [
    ...Object.keys(target),
    ...((Object.getOwnPropertySymbols
      ? Object.getOwnPropertySymbols(target).filter(symbol => {
          return Object.propertyIsEnumerable.call(target, symbol);
        })
      : []) as unknown as string[])
  ];
};

const mergeObject = (
  target: Record<string, any>,
  source: Record<string, any>,
  options?: any
) => {
  const destination: Record<string, any> = {};
  if (options.isMergeableObject(target)) {
    for (const key of getKeys(target)) {
      destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    }
  }
  for (const key of getKeys(source)) {
    destination[key] =
      propertyUnsafe(target, key) && options.isMergeableObject(source[key])
        ? getMergeFunction(key, options)(target[key], source[key], options)
        : cloneUnlessOtherwiseSpecified(source[key], options);
  }
  return destination;
};

/**
 * Deep merge two objects
 *
 * @param target - The target object
 * @param source - The source object
 * @param options - The options object
 * @returns The merged object
 */
export const deepMerge = <X = any, Y = any, Z = X & Y>(
  target: X,
  source: Y,
  options: any = {}
): Z => {
  if (!target || !source) {
    // eslint-disable-next-line unicorn/prefer-logical-operator-over-ternary
    return (target || source) as Z;
  }

  const _options = options || {};
  _options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  _options.isMergeableObject = _options.isMergeableObject || isMergeableObject;
  // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
  // implementations can use it. The caller may not replace it.
  _options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

  const sourceIsArray = Array.isArray(source);
  const targetIsArray = Array.isArray(target);
  const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, _options);
  }
  if (sourceIsArray) {
    return _options.arrayMerge(target, source, _options);
  }
  return mergeObject(target, source, _options) as Z;
};

deepMerge.all = function deepMergeAll(array: any[], options?: any) {
  if (!Array.isArray(array)) {
    throw new TypeError("first argument should be an array");
  }

  return array.reduce((prev, next) => {
    return deepMerge(prev, next, options);
  }, {});
};
