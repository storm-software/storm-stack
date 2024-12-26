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

import chalk from "chalk";
import terminalLink from "terminal-link";

/**
 * Create a link to a URL in the terminal.
 *
 * @param url - The URL to link to.
 * @returns A terminal link
 */
export function link(url: string): string {
  return terminalLink(url, url, {
    fallback: url => chalk.underline(url)
  });
}
