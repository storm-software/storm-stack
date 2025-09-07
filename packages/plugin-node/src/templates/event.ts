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
import type { Context } from "@storm-stack/core/types/context";

export function EventModule(_context: Context) {
  return `
/**
 * The Storm Stack event module.
 *
 * @module storm:event
 */

${getFileHeader()}

import { StormEventInterface } from "@storm-stack/core/runtime-types/node/event";
import { uniqueId } from "storm:id";
import { useStorm } from "storm:context";

/**
 * A base event class used by the Storm Stack runtime.
 */
export class StormEvent<
  TEventType extends string = string,
  TData extends Record<string, any> = Record<string, any>
> implements StormEventInterface<TEventType, TData> {
  /**
   * The event timestamp.
   */
  public readonly timestamp: number = Date.now();

  /**
   * The event identifier.
   */
  public readonly id: string = uniqueId();

  /**
   * The event data object.
   */
  public readonly data: TData;

  /**
   * The request identifier.
   */
  public readonly requestId: string = useStorm().request.id;

  /**
   * The event type.
   */
  public readonly type: TEventType;

  /**
   * The event version.
   */
  public readonly version: string = "1.0";

  /**
   * The event label.
   *
   * @remarks
   * The label format is "{type}-v{version}"
   */
  public get label(): string {
    return \`\${this.type}-v\${this.version}\`;
  }

  /**
   * Creates a new event.
   *
   * @param type - The event type.
   * @param data - The event data.
   */
  public constructor(
    type: TEventType,
    data: TData
  ) {
    this.type = type;
    this.data = data;
  }
}`;
}
