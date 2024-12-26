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

import { timeout } from "./timeout";

/**
 * Executes an async function and enforces a timeout.
 *
 * If the promise does not resolve within the specified time,
 * the timeout will trigger and the returned promise will be rejected.
 *
 * @example
 * ```typescript
 * try {
 *   await withTimeout(() => {}, 1000); // Timeout exception after 1 second
 * } catch (error) {
 *   console.error(error); // Will log 'TimeoutError'
 * }
 * ```
 *
 * @param run - A function that returns a promise to be executed.
 * @param ms - The timeout duration in milliseconds.
 * @returns A promise that resolves with the result of the `run` function or rejects if the timeout is reached.
 */
export async function withTimeout<T>(
  run: () => Promise<T>,
  ms: number
): Promise<T> {
  return Promise.race([run(), timeout(ms) as T]);
}
