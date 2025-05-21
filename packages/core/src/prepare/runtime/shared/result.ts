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

import { getFileHeader } from "../../../helpers/utilities/file-header";

export function writeResult() {
  return `${getFileHeader()}

import { IStormResult } from "@storm-stack/types/result";
import { isStormError, StormError } from "./error";
import { useStorm } from "./context";

/**
 * A base result class used by the Storm Stack runtime.
 */
export class StormResult<
  TData extends any | StormError = any | StormError
> implements IStormResult<TData>
{
  /**
   * Create a new result.
   *
   * @remarks
   * **IMPORTANT:** This function uses the \`$storm\` context object - never use this function outside of the context wrapper/tree since the context will not be available.
   *
   * @param data - The result data
   */
  public static create<TData>(
    data: TData
  ): StormResult<TData> {
    return new StormResult(
      useStorm().payload.id,
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
   * The payload identifier.
   */
  public readonly payloadId: string;

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
   * @param payloadId - The payload identifier.
   * @param meta - The current context's metadata.
   * @param data - The result data
   */
  public constructor(
    payloadId: string,
    meta: Record<string, any>,
    data: TData
  ) {
    this.payloadId = payloadId;
    this.meta = meta;
    this.data = data;
  }
}

  `;
}
