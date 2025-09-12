/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

/**
 * Interface representing a Storm request.
 */
export interface StormRequestInterface<
  TData extends Record<string, any> = Record<string, any>
> {
  /**
   * The timestamp of the request.
   */
  readonly timestamp: number;

  /**
   * The unique identifier for the request.
   */
  readonly id: string;

  /**
   * The headers associated with the request.
   */
  readonly headers: Record<string, any>;

  /**
   * The data associated with the request.
   */
  readonly data: TData;

  /**
   * Merges the given data into the request.
   *
   * @param data - The data to merge into the request.
   */
  merge: (data: Partial<TData>) => void;
}
