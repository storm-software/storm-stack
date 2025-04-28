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

import { getFileHeader } from "@storm-stack/core/helpers";

export function writeEvent() {
  return `${getFileHeader()}

import type { IStormEvent } from "@storm-stack/plugin-node/types";

/**
 * A base event class used by the Storm Stack runtime.
 */
export class StormEvent<TEventType extends string = string, TEventData = any>
  extends StormRequest<TEventData> implements IStormEvent<TEventType, TEventData> {
  /**
   * The request identifier.
   */
  public readonly requestId: string = $storm.request.id;

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
    data: TEventData
  ) {
    super(data);
    this.type = type;
  }
}`;
}
