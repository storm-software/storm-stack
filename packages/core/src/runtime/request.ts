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

import { uniqueId } from "./id";
import type { IStormRequest } from "@storm-stack/types";

/**
 * A base request class used by the Storm Stack runtime.
 */
export class StormRequest<TData = any> implements IStormRequest<TData> {
  /**
   * The metadata associated with the request.
   */
  public readonly meta: Record<string, any>;

  /**
   * Any identifiers associated with the request.
   */
  public readonly identifiers?: Record<string, any>;

  /**
   * Any parameters associated with the request.
   */
  public readonly params?: Record<string, any>;

  /**
   * The payload data associated with the request.
   */
  public readonly data: TData;

  /**
   * The request identifier.
   */
  public readonly id = uniqueId();

  /**
   * The request created timestamp.
   */
  public readonly timestamp = Date.now();

  /**
   * Create a new request object.
   *
   * @param data - The request data.
   * @param meta - The request metadata.
   * @param params - The request parameters.
   * @param identifiers - The request identifiers.
   */
  public constructor(
    data: TData,
    meta = {},
    params?: Record<string, any>,
    identifiers?: Record<string, any>
  ) {
    this.data = data;
    this.meta = meta;
    this.params = params;
    this.identifiers = identifiers;
  }
}
  `;
}
