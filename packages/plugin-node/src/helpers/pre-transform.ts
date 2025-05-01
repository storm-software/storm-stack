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

import type {
  Context,
  Options,
  SourceFile
} from "@storm-stack/core/types/build";
import { transformContext } from "./transform-context";

/**
 * Pre-transform function for the Node plugin.
 * This function is called before the main transform function.
 * It is used to modify the source file before it is transformed.
 *
 * @param context - The context object containing options and other information.
 * @param sourceFile - The source file to be transformed.
 * @returns The transformed source file.
 */
export function preTransform<TOptions extends Options = Options>(
  context: Context<TOptions>,
  sourceFile: SourceFile
) {
  return transformContext(sourceFile);
}
