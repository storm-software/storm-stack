/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getFileHeader } from "../../../helpers/utilities/file-header";

export function writeId() {
  return `
/**
 * The ID module provides a set of utilities for generating unique identifiers.
 *
 * @module storm:id
 */

${getFileHeader()}

import { StormError } from "./error";

/**
 * Generate a random string
 *
 * @param array - The array to fill with random values
 * @returns The array filled with random values
 */
export function getRandom(array: Uint8Array) {
  if (array === null) {
    throw new StormError({ type: "general", code: 9 });
  }

  // Fill the array with random values
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256); // Random byte (0-255)
  }

  return array;
}

/**
 * A platform agnostic version of the [nanoid](https://github.com/ai/nanoid) package with some modifications.
 *
 * @param size - The size of the string to generate. Defaults to 21 if not provided.
 * @returns A unique identifier following the nanoid format
 */
export function uniqueId(size?: number | undefined): string;

/**
 * A platform agnostic version of the [nanoid](https://github.com/ai/nanoid) package with some modifications.
 *
 * @param prefix - The prefix to use for the unique identifier
 * @param size - The size of the string to generate. Defaults to 21 if not provided.
 * @returns A unique identifier following the nanoid format
 */
export function uniqueId(prefix?: string, size?: number | undefined): string;

/**
 * A platform agnostic version of the [nanoid](https://github.com/ai/nanoid) package with some modifications.
 *
 * @param param - The parameter to use for the unique identifier, can be a string or number
 * @param size - The size of the string to generate. Defaults to 21 if not provided.
 * @returns A unique identifier following the nanoid format
 */
export function uniqueId(param?: string | number | undefined, size?: number | undefined): string {
  if (typeof param === "number") {
    size = param;
  } else if (!param || !size) {
    size = 21; // Default size if not provided
  }

  // Use our custom getRandom function to fill a Uint8Array with random values.
  const randomBytes = getRandom(new Uint8Array(typeof param === "string" ? size - (param.length + 1) : size));

  let result = "";
  if (typeof param === "string") {
    // If the parameter is a string, use it as a prefix.
    result = param + "_";
  }

  return result + randomBytes.reduce((id, byte) => {
    // It is incorrect to use bytes exceeding the alphabet size.
    // The following mask reduces the random byte in the 0-255 value
    // range to the 0-63 value range. Therefore, adding hacks, such
    // as empty string fallback or magic numbers, is unnecessary because
    // the bitmask trims bytes down to the alphabet size.
    byte &= 63;
    if (byte < 36) {
      // \`0-9a-z\`
      id += byte.toString(36);
    } else if (byte < 62) {
      // \`A-Z\`
      id += (byte - 26).toString(36).toUpperCase();
    } else if (byte > 62) {
      id += "-";
    } else {
      id += "_";
    }
    return id;
  }, "");
}
  `;
}
