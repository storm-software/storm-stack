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
export class StormRequest<
  TData = any,
  TIdentifiers extends Record<string, any> = Record<string, any>,
  TParams extends Record<string, any> = Record<string, any>,
  TMeta extends Record<string, any> = Record<string, any>
> implements IStormRequest<TData, TIdentifiers, TParams, TMeta> {
  /**
   * The payload data associated with the request.
   */
  public readonly data: TData;

  /**
   * Any identifiers associated with the request.
   */
  public readonly identifiers: TIdentifiers;

  /**
   * Any parameters associated with the request.
   */
  public readonly params?: TParams;

  /**
   * The metadata associated with the request.
   */
  public readonly meta: TMeta;

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
    params?: TParams,
    identifiers?: TIdentifiers
  ) {
    this.data = data;
    this.meta = meta;
    this.params = params;
    this.identifiers = identifiers;
  }
}
  `;
}
