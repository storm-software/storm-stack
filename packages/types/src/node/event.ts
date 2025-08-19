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
 * Interface representing a Storm event.
 *
 * @template TType - The type of the event.
 * @template TData - The data associated with the event.
 */
export interface StormEventInterface<
  TType extends string = string,
  TData extends Record<string, any> = Record<string, any>
> {
  /**
   * The timestamp of the event.
   */
  timestamp: number;

  /**
   * The unique identifier for the event.
   */
  id: string;

  /**
   * The event data object.
   */
  data: TData;

  /**
   * The unique identifier for the current request.
   */
  requestId: string;

  /**
   * The type of the event.
   */
  type: TType;

  /**
   * The version of the event.
   */
  version: string;

  /**
   * The event label.
   *
   * @remarks
   * The label format is "\{type\}-v\{version\}"
   */
  label: string;
}
