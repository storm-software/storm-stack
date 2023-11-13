/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  isFunction,
  isMergeableObject,
  propertyExists,
  propertyUnsafe
} from "../type-checks";

const emptyTarget = (val: any) => {
  return Array.isArray(val) ? [] : {};
};

const cloneUnlessOtherwiseSpecified = (value: any, options?: any) => {
  return options.clone !== false && options.isMergeableObject(value)
    ? deepMerge(emptyTarget(value), value, options)
    : value;
};

const defaultArrayMerge = (
  target: Array<any>,
  source: Array<any>,
  options?: any
) => {
  return target.concat(source).map(element => {
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
  return Object.keys(target).concat(
    (Object.getOwnPropertySymbols
      ? Object.getOwnPropertySymbols(target).filter(symbol => {
          return Object.propertyIsEnumerable.call(target, symbol);
        })
      : []) as unknown as string[]
  );
};

const mergeObject = (
  target: Record<string, any>,
  source: Record<string, any>,
  options?: any
) => {
  const destination: Record<string, any> = {};
  if (options.isMergeableObject(target)) {
    getKeys(target).forEach(key => {
      destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    });
  }
  getKeys(source).forEach(key => {
    if (propertyExists(target, key)) {
      return;
    }

    if (propertyUnsafe(target, key) && options.isMergeableObject(source[key])) {
      destination[key] = getMergeFunction(key, options)(
        target[key],
        source[key],
        options
      );
    } else {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
    }
  });
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
    return (target ? target : source) as Z;
  }

  options = options || {};
  options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  options.isMergeableObject = options.isMergeableObject || isMergeableObject;
  // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
  // implementations can use it. The caller may not replace it.
  options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

  const sourceIsArray = Array.isArray(source);
  const targetIsArray = Array.isArray(target);
  const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, options);
  } else if (sourceIsArray) {
    return options.arrayMerge(target, source, options);
  } else {
    return mergeObject(target, source, options) as Z;
  }
};

deepMerge.all = function deepMergeAll(array: Array<any>, options?: any) {
  if (!Array.isArray(array)) {
    throw new Error("first argument should be an array");
  }

  return array.reduce((prev, next) => {
    return deepMerge(prev, next, options);
  }, {});
};
