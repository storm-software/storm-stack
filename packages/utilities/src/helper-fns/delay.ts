import { AbortError } from "../types";

interface DelayOptions {
  signal?: AbortSignal;
}

/**
 * Delays the execution of code for a specified number of milliseconds.
 *
 * This function returns a Promise that resolves after the specified delay, allowing you to use it
 * with async/await to pause execution.
 *
 * @example
 * ```typescript
 * async function foo() {
 *   console.log('Start');
 *   await delay(1000); // Delays execution for 1 second
 *   console.log('End');
 * }
 *
 * foo();
 *
 * // With AbortSignal
 * const controller = new AbortController();
 * const { signal } = controller;
 *
 * setTimeout(() => controller.abort(), 50); // Will cancel the delay after 50ms
 * try {
 *   await delay(100, { signal });
 *  } catch (error) {
 *   console.error(error); // Will log 'AbortError'
 *  }
 * }
 * ```
 *
 * @param ms - The number of milliseconds to delay.
 * @param options - The options object.
 * @returns A Promise that resolves after the specified delay.
 */
export function delay(
  ms: number,
  { signal }: DelayOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const abortError = () => {
      reject(new AbortError());
    };

    const abortHandler = () => {
      clearTimeout(timeoutId);
      abortError();
    };

    if (signal?.aborted) {
      return abortError();
    }

    const timeoutId = setTimeout(resolve, ms);

    signal?.addEventListener("abort", abortHandler, { once: true });
  });
}
