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

import { StormErrorInterface } from "../shared/error.js";

/**
 * A Storm response interface. It represents the structure of a response returned by the Storm Stack runtime.
 *
 * @remarks
 * The `StormResponseInterface` interface is used to standardize the structure of responses returned by the Storm Stack runtime.
 * It includes properties for the request ID, data, error information, timestamp, and success status.
 */
export interface StormResponseInterface<
  TData extends any | StormErrorInterface = any | StormErrorInterface
> {
  /**
   * The unique identifier for the request.
   */
  requestId: string;

  /**
   * The response headers.
   */
  readonly headers: Record<string, any>;

  /**
   * The data of the response.
   */
  data: TData;

  /**
   * The timestamp of the response.
   */
  timestamp: number;

  /**
   * An indicator of whether the response was successful.
   */
  success: boolean;
}
