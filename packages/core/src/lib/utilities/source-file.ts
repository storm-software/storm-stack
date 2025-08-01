/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { readFileIfExistingSync } from "@stryke/fs/read-file";
import { isString } from "@stryke/type-checks/is-string";
import MagicString from "magic-string";
import { SourceFile } from "../../types/compiler";

/**
 * Get the string from the source.
 *
 * @param code - The source string or magic string.
 * @returns The source string.
 */
export function getString(code: string | MagicString): string {
  if (isString(code)) {
    return code;
  }

  return code.toString();
}

/**
 * Get the magic string.
 *
 * @param code - The source string or magic string.
 * @returns The magic string.
 */
export function getMagicString(code: string | MagicString): MagicString {
  if (isString(code)) {
    return new MagicString(code);
  }

  return code;
}

/**
 * Get the source file.
 *
 * @param id - The name of the file.
 * @param code - The source code.
 * @returns The source file.
 */
export function getSourceFile(
  id: string,
  code?: string | MagicString
): SourceFile {
  const content = code ?? readFileIfExistingSync(id);

  return {
    id,
    code: getMagicString(content),
    env: []
  };
}
