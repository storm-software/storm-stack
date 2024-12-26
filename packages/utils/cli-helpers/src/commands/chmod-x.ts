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

import fs from "node:fs";

/**
 * Adds execute permissions to a file
 *
 * @param file - The file to add execute permissions to
 */
export function chmodX(file: string): void {
  // Note: skip for windows as chmod does on exist there
  // and will error with `EACCES: permission denied`
  if (process.platform === "win32") {
    return;
  }

  const s = fs.statSync(file);
  const newMode = s.mode | 64 | 8 | 1;
  if (s.mode === newMode) {
    return;
  }
  const base8 = newMode.toString(8).slice(-3);

  fs.chmodSync(file, base8);
}
