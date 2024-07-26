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
