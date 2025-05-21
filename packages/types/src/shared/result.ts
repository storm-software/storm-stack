/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

/* eslint-disable ts/consistent-type-imports */

import { IStormError } from "./error.js";

/**
 * A Storm result interface. It represents the structure of a result returned by the Storm Stack runtime.
 *
 * @remarks
 * The `IStormResult` interface is used to standardize the structure of results returned by the Storm Stack runtime.
 * It includes properties for the request ID, data, error information, timestamp, and success status.
 */
export interface IStormResult<
  TData extends any | IStormError = any | IStormError
> {
  /**
   * The unique identifier for the payload.
   */
  payloadId: string;

  /**
   * The result meta.
   */
  meta: Record<string, any>;

  /**
   * The data of the result.
   */
  data: TData;

  /**
   * The timestamp of the result.
   */
  timestamp: number;

  /**
   * An indicator of whether the result was successful.
   */
  success: boolean;
}
