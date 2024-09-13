/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://docs.stormsoftware.com/projects/storm-stack
 Contact:         https://stormsoftware.com/contact
 Licensing:       https://stormsoftware.com/licensing

 -------------------------------------------------------------------*/

import { TimeoutError } from "../types";
import { delay } from "./delay";

/**
 * Returns a promise that rejects with a `TimeoutError` after a specified delay.
 *
 * @param ms - The delay duration in milliseconds.
 * @returns A promise that rejects with a `TimeoutError` after the specified delay.
 * @throws Throws a `TimeoutError` after the specified delay.
 */
export async function timeout(ms: number): Promise<never> {
  await delay(ms);
  throw new TimeoutError();
}
