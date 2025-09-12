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
 * The request module provides a base request class used by the Storm Stack runtime.
 *
 * @param _context - The context of the Storm Stack runtime, which includes configurations and utilities.
 * @returns A string representing the request module code.
 */
export function RequestModule(_context: Context) {
  return `
/**
 * The request module provides a base request class used by the Storm Stack runtime.
 *
 * @module storm:request
 */

${getFileHeader()}

import { uniqueId } from "storm:id";
import { StormRequestInterface } from "@storm-stack/core/runtime-types/browser/request";

/**
 * A base request class used by the Storm Stack runtime.
 */
export class StormRequest<
  TData extends Record<string, any> = Record<string, any>
> implements StormRequestInterface<TData> {
  /**
   * The request identifier.
   */
  public readonly id = uniqueId();

  /**
   * The request created timestamp.
   */
  public readonly timestamp = Date.now();

  /**
   * The headers associated with the request.
   */
  public readonly headers: Record<string, any> = {};

  /**
   * The request data.
   */
  readonly data: TData;

  /**
   * Create a new request object.
   *
   * @param data - The request input data.
   */
  public constructor(
    data: TData
  ) {
    this.data = data;
  }
}
  `;
}
