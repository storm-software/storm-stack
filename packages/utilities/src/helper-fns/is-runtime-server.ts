/**
 * The function checks if the code is running on
 * the server (and not in the browser).
 */
export const isRuntimeServer = (): boolean =>
  typeof window === "undefined" || "Deno" in window;

/**
 * The function checks if the code is running in
 * the browser (and not on the server).
 */
export const isRuntimeClient = (): boolean => !isRuntimeServer();
