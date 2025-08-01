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

import { StormPayloadInterface } from "../shared/payload";

/**
 * Interface representing a Storm event.
 *
 * @template TEventType - The type of the event.
 * @template TData - The data associated with the event.
 */
export interface StormEventInterface<
  TEventType extends string = string,
  TData = any
> extends StormPayloadInterface<TData> {
  /**
   * The unique identifier for the payload.
   */
  payloadId: string;

  /**
   * The type of the event.
   */
  type: TEventType;

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
