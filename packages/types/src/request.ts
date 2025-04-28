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

export interface IStormRequest<
  TData = any,
  TIdentifiers extends Record<string, any> = Record<string, any>,
  TParams extends Record<string, any> = Record<string, any>,
  TMeta extends Record<string, any> = Record<string, any>
> {
  /**
   * The timestamp of the request.
   */
  timestamp: number;

  /**
   * The unique identifier for the request.
   */
  id: string;

  /**
   * Any metadata associated with the request.
   */
  meta: TMeta;

  /**
   * Any identifiers associated with the request.
   */
  identifiers: TIdentifiers;

  /**
   * Any parameters associated with the request.
   */
  params?: TParams;

  /**
   * The payload of the request.
   */
  data: TData;
}
