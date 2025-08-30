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

/**
 * Request JSON primitive field values.
 */
export type StormRequestJSONPrimitiveValue =
  | string
  | number
  | boolean
  | undefined
  | null;

/**
 * The possible values of a property on a Request JSON
 */
export type StormRequestJSONValue =
  | StormRequestJSONPrimitiveValue
  | StormRequestJSONArray
  | StormRequestJSONObject;

/**
 * Request JSON array values.
 */
export type StormRequestJSONArray = Array<StormRequestJSONValue>;

/**
 * Request JSON object values.
 */
export interface StormRequestJSONObject {
  [key: string]: StormRequestJSONValue;
}

/**
 * Interface representing a Storm request.
 */
export interface StormRequestInterface<
  TData extends Record<string, any> = Record<string, any>
> {
  /**
   * The timestamp of the request.
   */
  readonly timestamp: number;

  /**
   * The unique identifier for the request.
   */
  readonly id: string;

  /**
   * The data associated with the request.
   */
  readonly data: TData;

  /**
   * The body of the request.
   */
  readonly json: StormRequestJSONObject;
}
