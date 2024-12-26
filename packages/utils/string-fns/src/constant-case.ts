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

import { snakeCase } from "./snake-case";

/**
 * Convert the input string to constant case.
 *
 * @remarks
 * "THIS_IS_AN_EXAMPLE"
 *
 * @param input - The input string.
 * @returns The constant-cased string.
 */
export const constantCase = (input?: string): string | undefined => {
  return snakeCase(input)?.toUpperCase();
};
