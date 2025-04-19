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

export interface IStormRequest<TData = any> {
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
  meta: Record<string, any>;

  /**
   * Any identifiers associated with the request.
   */
  identifiers?: Record<string, any>;

  /**
   * Any parameters associated with the request.
   */
  params?: Record<string, any>;

  /**
   * The payload of the request.
   */
  data: TData;
}
