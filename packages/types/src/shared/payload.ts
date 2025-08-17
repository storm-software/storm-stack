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
 * Interface representing a Storm payload.
 */
export interface StormPayloadInterface<
  TData extends Record<string, any> = Record<string, any>
> {
  /**
   * The timestamp of the payload.
   */
  readonly timestamp: number;

  /**
   * The unique identifier for the payload.
   */
  readonly id: string;

  /**
   * The data associated with the payload.
   */
  readonly data: TData;

  /**
   * Merges the given data into the payload.
   *
   * @param data - The data to merge into the payload.
   */
  merge: (data: Partial<TData>) => void;
}
