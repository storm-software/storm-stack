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

import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import { Context } from "@storm-stack/core/types";

export function ResponseModule(_context: Context) {
  return `
/**
 * The response module provides the {@link StormResponse} class, which is used to represent the response of a request execution.
 *
 * @module storm:response
 */

${getFileHeader()}

import { StormResponseInterface } from "@storm-stack/core/runtime-types/browser/response";
import { isStormError, StormError } from "storm:error";
import { useStorm } from "storm:context";

/**
 * A base response class used by the Storm Stack runtime.
 */
export class StormResponse<
  TData extends any | StormError = any | StormError
> implements StormResponseInterface<TData> {
  /**
   * Create a new response.
   *
   * @remarks
   * **IMPORTANT:** This function uses the storm context object - never use this function outside of the context wrapper/tree since the context will not be available.
   *
   * @param data - The response data
   */
  public static create<TData>(
    data: TData
  ): StormResponse<TData> {
    return new StormResponse(
      useStorm().request.id,
      data
    );
  }

  /**
   * The headers associated with the response.
   */
  public readonly headers: Record<string, any> = {};

  /**
   * The response data.
   */
  public data: TData;

  /**
   * The request identifier.
   */
  public readonly requestId: string;

  /**
   * The response created timestamp.
   */
  public readonly timestamp = Date.now();

  /**
   * An indicator of whether the response was successful.
   */
  public get success() {
    return !isStormError(this.data);
  }

  /**
   * Create a new response.
   *
   * @param requestId - The request identifier.
   * @param headers - The headers associated with the response.
   * @param data - The response data
   */
  public constructor(
    requestId: string,
    data: TData
  ) {
    this.requestId = requestId;
    this.data = data;
  }
}

  `;
}
