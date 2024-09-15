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

/**
 * Upper case the first character of an input string.
 *
 *  @remarks
 * "Thisisanexample"
 *
 * @param input - The input string.
 * @returns The capitalized string.
 */
export const upperCaseFirst = (input?: string): string | undefined => {
  return input ? input.charAt(0).toUpperCase() + input.slice(1) : input;
};
