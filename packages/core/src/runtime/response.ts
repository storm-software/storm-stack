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

import { getFileHeader } from "../helpers/utilities/file-header";

export function writeResponse() {
  return `${getFileHeader()}

import type { IStormResponse } from "@storm-stack/core/types";
import { isStormError } from "./error";
import type { StormError } from "./error";

/**
 * A base response class used by the Storm Stack runtime.
 */
export class StormResponse<
  TData extends any | StormError = any | StormError
> implements IStormResponse<TData>
{
  /**
   * Create a new response.
   *
   * @remarks
   * **IMPORTANT:** This function uses the \`$storm\` context object - never use this function outside of the context wrapper/tree since the context will not be available.
   *
   * @param data - The response data
   */
  public static create<TData>(
    data: TData
  ): StormResponse<TData> {
    return new StormResponse(
      $storm.request.id,
      $storm.meta,
      data
    );
  }

  /**
   * The response meta.
   */
  public readonly meta: Record<string, any>;

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
   * @param meta - The current context's metadata.
   * @param data - The response data
   */
  public constructor(
    requestId: string,
    meta: Record<string, any>,
    data: TData
  ) {
    this.requestId = requestId;
    this.meta = meta;
    this.data = data;
  }
}

  `;
}
