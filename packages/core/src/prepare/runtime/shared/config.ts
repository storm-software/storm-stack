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

import { generateConfig } from "../../../helpers/dts/shared";
import { getFileHeader } from "../../../helpers/utilities/file-header";
import type { Context } from "../../../types/build";

export async function writeConfig(context: Context) {
  return `${getFileHeader()}

import { StormBaseConfig } from "@storm-stack/types/shared/config";

export interface StormConfig extends StormBaseConfig ${await generateConfig(
    context
  )}

`;
}
