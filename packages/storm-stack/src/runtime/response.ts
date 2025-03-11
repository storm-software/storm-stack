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
import type { IStormResponse } from "storm-stack/types";
import { isStormError } from "./error";

/**
 * A base response class used by the Storm Stack runtime.
 */
export class StormResponse<TData = any>
  implements IStormResponse<TData> {
  /**
   * The response meta.
   */
  public readonly meta: Record<string, any>;

  /**
   * The response data (if applicable).
   */
  public data?: TData;

  /**
   * The response error (if applicable).
   */
  public error?: StormError;

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
  public get success(): boolean {
    return !this.error;
  }

  /**
   * Create a new request.
   *
   * @param requestId - The request identifier.
   * @param meta - The response meta.
   * @param result - The request result.
   */
  public constructor(requestId: string, meta = {}, result?: TData | StormError) {
    this.requestId = requestId;
    this.meta = meta;

    if (isStormError(result)) {
      this.error = result;
    } else {
      this.data = result;
    }
  }
}`;
}
