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
 */
export const isDevelopment = (): boolean => !isProduction();
