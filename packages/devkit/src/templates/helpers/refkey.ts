/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { Refkey, refkey as refkeyExternal } from "@alloy-js/core";

/**
 * Create a refkey for the provided arguments. Passing no arguments returns a fresh refkey that is guaranteed to be unique. Otherwise, the arguments passed will be used to create a refkey for those values. Providing the same arguments will always return the same refkey.
 *
 * @remarks
 * Values are compared using the SameValueZero algorithm, which considers objects the same if they are reference identical, and primitives the same if they are the same value, with the exception of `NaN`, which is always considered equal to other `NaN` values, and `-0`, which is considered identical to `+0`
 */
export function refkey(...args: unknown[]): Refkey {
  return refkeyExternal("storm-stack", ...args);
}
