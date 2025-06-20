/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

/**
 * Sorts command argument aliases, placing single-character aliases first, followed by multi-character aliases, and then sorting them alphabetically.
 *
 * @param aliases - An array of argument aliases to sort.
 * @returns A new array of sorted aliases.
 */
export function sortArgAliases(aliases: string[]): string[] {
  if (aliases.length === 0) {
    return [];
  }

  const result = aliases.filter(alias => alias.length === 1);
  result.push(...aliases.filter(alias => alias.length > 1));

  return result.sort((a, b) => b.localeCompare(a));
}
