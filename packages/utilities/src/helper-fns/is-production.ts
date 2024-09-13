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

/**
 * Check the current runtime mode of the process
 *
 * @param mode - The mode to check the current process's mode against
 * @returns An indicator specifying if the current runtime matches the `mode` parameter
 */
export const isMode = (mode: string): boolean =>
  process.env.NODE_ENV?.toLowerCase() === mode;

/**
 * The function checks if the code is running in production.
 *
 * @returns A boolean indicating if the code is running in production.
 */
export const isProduction = (): boolean => isMode("production");

/**
 * The function checks if the code is **NOT** running in production.
 *
 * @remarks
 * **Please note:** This function does **not** check if the mode equals 'development' specifically.
 *
 * To check for the 'development' mode specifically, run:
 *
 * ```typescript
 * const isDevelopmentSpecifically = isMode("development");
 * ```
 *
 * @returns A boolean indicating if the code is **NOT** running in production.
 */
export const isDevelopment = (): boolean => !isProduction();
