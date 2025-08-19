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

export function ResultModule(_context: Context) {
  return `
/**
 * The result module provides the {@link StormResult} class, which is used to represent the result of a request execution.
 *
 * @module storm:result
 */

${getFileHeader()}

import { StormResultInterface } from "@storm-stack/types/node/result";
import { isStormError, StormError } from "storm:error";
import { useStorm } from "storm:context";

/**
 * A base result class used by the Storm Stack runtime.
 */
export class StormResult<
  TData extends any | StormError = any | StormError
> implements StormResultInterface<TData> {
  /**
   * Create a new result.
   *
   * @remarks
   * **IMPORTANT:** This function uses the storm context object - never use this function outside of the context wrapper/tree since the context will not be available.
   *
   * @param data - The result data
   */
  public static create<TData>(
    data: TData
  ): StormResult<TData> {
    return new StormResult(
      useStorm().request.id,
      useStorm().meta,
      data
    );
  }

  /**
   * The result meta.
   */
  public readonly meta: Record<string, any>;

  /**
   * The result data.
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
   * Create a new result.
   *
   * @param requestId - The request identifier.
   * @param meta - The current context's metadata.
   * @param data - The result data
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
