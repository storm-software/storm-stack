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

export function writeRequest() {
  return `${getFileHeader()}
import { nanoid } from "@stryke/unique-id/nanoid-client";
import type { IStormRequest } from "storm-stack/types";

/**
 * A base request class used by the Storm Stack runtime.
 */
export class StormRequest<TData = any>
  implements IStormRequest<TData> {
  /**
   * The request meta.
   */
  public readonly meta: Record<string, any>;

  /**
   * The request data.
   */
  public readonly data: TData;

  /**
   * The request identifier.
   */
  public readonly id = nanoid();

  /**
   * The request created timestamp.
   */
  public readonly timestamp = Date.now();

  /**
   * Create a new request.
   *
   * @param data - The request data.
   */
  public constructor(data: TData, meta = {}) {
    this.data = data;
    this.meta = meta;
  }
}`;
}
