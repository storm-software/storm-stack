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

import { lowerCaseFirst } from "./lower-case-first";
import { pascalCase } from "./pascal-case";

/**
 * Convert the input string to camel case.
 *
 * @remarks
 * "thisIsAnExample"
 *
 * @param input - The input string.
 * @returns The camel-cased string.
 */
export const camelCase = (input?: string): string | undefined => {
  return input ? lowerCaseFirst(pascalCase(input)) : input;
};
