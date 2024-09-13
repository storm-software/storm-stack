/*-------------------------------------------------------------------

                ⚡ Storm Software - Storm Trading

 This code was released as part of the Storm Trading project. Storm Trading
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-trading
 Documentation:   https://docs.stormsoftware.com/projects/storm-trading
 Contact:         https://stormsoftware.com/contact
 Licensing:       https://stormsoftware.com/licensing

 -------------------------------------------------------------------*/

/**
 * Creates a throttled function that only invokes the provided function at most once
 * per every `throttleMs` milliseconds. Subsequent calls to the throttled function
 * within the wait time will not trigger the execution of the original function.
 *
 * @example
 * ```typescript
 * const throttledFunction = throttle(() => {
 *   console.log('Function executed');
 * }, 1000);
 *
 * // Will log 'Function executed' immediately
 * throttledFunction();
 *
 * // Will not log anything as it is within the throttle time
 * throttledFunction();
 *
 * // After 1 second
 * setTimeout(() => {
 *   throttledFunction(); // Will log 'Function executed'
 * }, 1000);
 * ```
 *
 * @param func - The function to throttle.
 * @param throttleMs - The number of milliseconds to throttle executions to.
 * @returns A new throttled function that accepts the same parameters as the original function.
 */
export function throttle<F extends (...args: any[]) => void>(
  func: F,
  throttleMs: number
): F {
  let lastCallTime: number | null;

  const throttledFunction = function (...args: Parameters<F>) {
    const now = Date.now();

    // eslint-disable-next-line eqeqeq
    if (lastCallTime == null || now - lastCallTime >= throttleMs) {
      lastCallTime = now;
      func(...args);
    }
  } as F;

  return throttledFunction;
}
