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
 * The function checks if the code is running on the server-side
 *
 * @returns An indicator specifying if the code is running on the server-side
 */
export const isRuntimeServer = (): boolean =>
  typeof window === "undefined" || "Deno" in window;

/**
 * The function checks if the code is running in
 * the browser (and not on the server).
 */
export const isRuntimeClient = (): boolean => !isRuntimeServer();
