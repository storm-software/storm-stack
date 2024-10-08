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
