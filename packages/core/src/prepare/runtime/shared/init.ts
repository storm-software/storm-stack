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

import { getFileHeader } from "../../../helpers/utilities/file-header";
import type { Context } from "../../../types/build";

export function writeInit(_context: Context) {
  return `${getFileHeader()}

// Do nothing - this is a placeholder for Storm Stack plugins that do not require any initialization

export default function init() {
  // This function is intentionally left empty.
  // It serves as a placeholder for Storm Stack plugins that do not require any initialization.
}
`;
}
