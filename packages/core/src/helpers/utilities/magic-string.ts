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

import { isString } from "@stryke/type-checks/is-string";
import MagicString from "magic-string";

export function getString(source: string | MagicString): string {
  if (isString(source)) {
    return source;
  }

  return source.toString();
}

/**
 * Get the magic string.
 *
 * @param source - The source string or magic string.
 * @returns The magic string.
 */
export function getMagicString(source: string | MagicString): MagicString {
  if (isString(source)) {
    return new MagicString(source);
  }

  return source;
}
