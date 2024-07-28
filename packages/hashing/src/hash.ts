import { isString } from "@storm-stack/types";
import { HashOptions, hashObject } from "./hash-object";
import { sha256base64 } from "./sha-256";

/**
 * Hash any JS value into a string
 *
 * @param object - The value to hash
 * @param  options - Hashing options
 * @returns A hashed string value
 */
export function hash(object: any, options?: HashOptions): string {
  return sha256base64(
    isString(object) ? object : hashObject(object, options)
  ).slice(0, 10);
}
