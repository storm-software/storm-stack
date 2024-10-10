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

import { isNumber, isSetString } from "@storm-stack/types";

/**
 * Converts an array of path segments into a deep key string.
 *
 * This function takes an array of strings and numbers representing path segments and combines them into a deep key string.
 *
 * @example
 * toDeepKey(['a', 'b', 'c']) // Returns 'a.b.c'
 * toDeepKey(['a', 0, 'c']) // Returns 'a[0].c'
 * toDeepKey(['', 'a', 'b', 'c']) // Returns '.a.b.c'
 * toDeepKey(['a', 'b.c', 'd']) // Returns 'a.b.c.d'
 * toDeepKey([]) // Returns ''
 * toDeepKey(['', 'a', 'b', 'c', 'd', 'e', 'f.g', 'h']) // Returns '.a.b.c.d.e.f.g.h'
 *
 * @param path - An array of strings and numbers representing path segments.
 * @returns A deep key string.
 */
export function toDeepKey(path: string[]): string {
  return path.reduce((ret, segment) => {
    return addPathToDeepKey(ret, segment);
  });
}

/**
 * Adds a path segment to a deep key string.
 *
 * This function takes a deep key string and a path segment and combines them into a new deep key string.
 *
 * @param deepKey - The deep key string to add the path segment to.
 * @param path - The path segment to add to the deep key string.
 * @returns A new deep key string.
 *
 * @example
 * addPathToDeepKey('a.b', 'c') // Returns 'a.b.c'
 * addPathToDeepKey('a[0]', 'c') // Returns 'a[0].c'
 * addPathToDeepKey('.a.b', 'c') // Returns '.a.b.c'
 * addPathToDeepKey('a.b', 'b.c') // Returns 'a.b.b.c'
 * addPathToDeepKey('', 'a') // Returns 'a'
 * addPathToDeepKey('.a.b', 'c.d') // Returns '.a.b.c.d'
 */
export function addPathToDeepKey(
  deepKey: string,
  path: string | number
): string {
  if (isNumber(path) || Number.isInteger(path)) {
    return deepKey + `[${path}]`;
  }
  if (isSetString(path)) {
    return deepKey + `.${path}`;
  }

  return deepKey;
}
