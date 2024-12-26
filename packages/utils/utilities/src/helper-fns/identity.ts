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

/**
 * Returns the input value unchanged.
 *
 * @example
 * ```ts
 * identity(5); // Returns 5
 * identity('hello'); // Returns 'hello'
 * identity({ key: 'value' }); // Returns { key: 'value' }
 * ```
 *
 * @template T - The type of the input value.
 * @param x - The value to be returned.
 * @returns The input value.
 */
export function identity<T>(x: T): T {
  return x;
}
