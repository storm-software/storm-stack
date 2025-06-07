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

import { generateVariables } from "../../../helpers/dts/shared";
import { getFileHeader } from "../../../helpers/utilities/file-header";
import type { Context, Options } from "../../../types/build";

export function writeVars<TOptions extends Options = Options>(
  context: Context<TOptions>
) {
  return `${getFileHeader()}

import { StormBaseVariables } from "@storm-stack/types/shared/vars";

export interface StormVariables extends StormBaseVariables ${generateVariables(
    context.dotenv.types.variables.reflection
  )}

`;
}
