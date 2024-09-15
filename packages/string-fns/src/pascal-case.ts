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
 * Convert the input string to pascal case.
 *
 *  @remarks
 * "ThisIsAnExample"
 *
 * @param input - The input string.
 * @returns The pascal-cased string.
 */
export const pascalCase = (input?: string): string | undefined => {
  return input
    ? input
        .split(" ")
        .map(i =>
          i.length > 0
            ? i.trim().charAt(0).toUpperCase() + i.trim().slice(1)
            : ""
        )
        .join("")
    : input;
};
