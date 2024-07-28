import { sha3_512 } from "@noble/hashes/sha3";
import { isSet, isString } from "@storm-stack/types";

/**
 * Default radix for the BigInt.toString() method.
 */
const DEFAULT_RADIX = 36;

/**
 * Transform a Uint8Array into a BigInt.
 *
 * @remarks
 * Adapted from https://github.com/juanelas/bigint-conversion
 * MIT License Copyright (c) 2018 Juan Hernández Serrano
 *
 * @param buf - Buffer to transform
 * @returns A BigInt value
 */
function bufToBigInt(buf: Uint8Array): bigint {
  const bits = 8n;

  let value = 0n;
  for (const i of buf.values()) {
    const bi = BigInt(i);
    value = (value << bits) + bi;
  }

  return value;
}

/**
 * Create a hash from a string.
 *
 * @param input - String to hash
 * @returns The hashed string
 */
export function hash(input: string | object): string {
  return isString(input) ? hashString(input) : hashObject(input);
}

/**
 * Create a hash from a string.
 *
 * @param input - String to hash
 * @returns The hashed string
 */
function hashString(inputStr = ""): string {
  // Drop the first character because it will bias the histogram
  // to the left.
  return bufToBigInt(sha3_512(inputStr)).toString(DEFAULT_RADIX).slice(1);
}

const HASH_TABLE = new WeakMap<object, number | string>();
let counter = 0;

/**
 * Create a Hash from an object.
 *
 * @param inputObj - The object to hash
 * @returns The hashed object
 */
const hashObject = (inputObj: Record<string, any> = {}): string => {
  const type = typeof inputObj;
  const constructorFn = inputObj?.constructor;
  // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
  const isDate = constructorFn == Date;

  let result: any;
  let index: any;

  // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
  if (Object(inputObj) === inputObj && !isDate && constructorFn != RegExp) {
    // Object/function, not null/date/regexp. Use WeakMap to store the id first.
    // If it's already hashed, directly return the result.
    result = HASH_TABLE.get(inputObj);
    if (result) {
      return result;
    }

    // Store the hash first for circular reference detection before entering the
    // recursive `stableHash` calls.
    // For other objects like set and map, we use this id directly as the hash.
    result = `${++counter}~`;
    HASH_TABLE.set(inputObj, result);

    // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
    if (constructorFn == Array) {
      // Array.
      result = "@";
      for (index = 0; index < inputObj.length; index++) {
        result += `${hashObject(inputObj[index])},`;
      }
      HASH_TABLE.set(inputObj, result);
    }
    // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
    if (constructorFn == Object) {
      // Object, sort keys.
      result = "#";
      const keys = Object.keys(inputObj).sort();
      // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
      while (!isSet((index = keys.pop() as string))) {
        if (!isSet(inputObj[index])) {
          result += `${index}:${hashObject(inputObj[index])},`;
        }
      }
      HASH_TABLE.set(inputObj, result);
    }
  } else {
    result = isDate
      ? inputObj.toJSON()
      : type === "symbol"
        ? inputObj.toString()
        : type === "string"
          ? JSON.stringify(inputObj)
          : `${inputObj}`;
  }

  return result;
};
