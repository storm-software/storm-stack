/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

/* eslint-disable ts/consistent-type-imports */

import { IStormError } from "./error.js";

/**
 * A Storm response interface. It represents the structure of a response returned by the Storm Stack runtime.
 *
 * @remarks
 * The `IStormResponse` interface is used to standardize the structure of responses returned by the Storm Stack runtime.
 * It includes properties for the request ID, metadata, payload data, error information, timestamp, and success status.
 */
export interface IStormResponse<
  TData extends any | IStormError = any | IStormError
> {
  /**
   * The unique identifier for the request.
   */
  requestId: string;

  /**
   * Any metadata associated with the response.
   */
  meta: Record<string, any>;

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
