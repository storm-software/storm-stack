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

import { ACRONYMS } from "./acronyms";
import { upperCaseFirst } from "./upper-case-first";

/**
 * Convert the input string to title case.
 *
 *  @remarks
 * "This Is An Example"
 *
 * @param input - The input string.
 * @returns The title cased string.
 */
export const titleCase = (input?: string): string | undefined => {
  if (!input) {
    return "";
  }

  return input
    .split(/(?=[A-Z])|[\s._-]/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s =>
      ACRONYMS.includes(s) ? s.toUpperCase() : upperCaseFirst(s.toLowerCase())
    )
    .join(" ");
};
