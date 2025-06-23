/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getFileHeader } from "../../../helpers/utilities/file-header";

export function writePayload() {
  return `
/**
 * The payload module provides a base payload class used by the Storm Stack runtime.
 *
 * @module storm:payload
 */

${getFileHeader()}

import { uniqueId } from "./id";
import { IStormPayload } from "@storm-stack/types/payload";

/**
 * A base payload class used by the Storm Stack runtime.
 */
export class StormPayload<
  TData = object
> implements IStormPayload<TData> {
  /**
   * The data associated with the payload.
   */
  public readonly data: TData;

  /**
   * The payload identifier.
   */
  public readonly id = uniqueId();

  /**
   * The payload created timestamp.
   */
  public readonly timestamp = Date.now();

  /**
   * Create a new payload object.
   *
   * @param data - The payload data.
   */
  public constructor(
    data: TData
  ) {
    this.data = data;
  }
}
  `;
}
