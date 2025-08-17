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
import { Context } from "@storm-stack/core/types/context";

/**
 * The payload module provides a base payload class used by the Storm Stack runtime.
 *
 * @param _context - The context of the Storm Stack runtime, which includes configurations and utilities.
 * @returns A string representing the payload module code.
 */
export function PayloadModule(_context: Context) {
  return `
/**
 * The payload module provides a base payload class used by the Storm Stack runtime.
 *
 * @module storm:payload
 */

${getFileHeader()}

import { uniqueId } from "storm:id";
import { StormError } from "storm:error";
import { StormPayloadInterface } from "@storm-stack/types/payload";

/**
 * A base payload class used by the Storm Stack runtime.
 */
export class StormPayload<
  TData extends Record<string, any> = Record<string, any>
> implements StormPayloadInterface<TData> {
  /**
   * The payload identifier.
   */
  public readonly id = uniqueId();

  /**
   * The payload created timestamp.
   */
  public readonly timestamp = Date.now();

  /**
   * The payload data.
   */
  readonly data: TData;

  /**
   * Create a new payload object.
   *
   * @param data - The payload input data.
   */
  public constructor(
    data: TData
  ) {
    this.data = data;
  }

  /**
   * Merges the given data into the payload.
   *
   * @param data - The data to merge into the payload.
   */
  public merge(data: Partial<TData>) {
    Object.assign(this.data, data);
  };
}
  `;
}
