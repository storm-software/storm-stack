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

import type { SourceFile } from "../../types/build";
import { getMagicString, getString } from "../utilities/magic-string";

export function transformContext(source: SourceFile): SourceFile {
  if (getString(source.code).includes("$storm")) {
    source.code = getMagicString(
      getString(source.code).replaceAll("$storm", "useStorm()")
    );
  }

  return source;
}
