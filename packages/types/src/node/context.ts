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

/* eslint-disable ts/consistent-type-imports */

import { Storage } from "unstorage";
import { StormEnv } from "../shared/env";
import { IStormLog } from "../shared/log";
import { IStormPayload } from "../shared/payload";
import { StormBuildInfo, StormRuntimeInfo } from "./env";
import { IStormEvent } from "./event";

/**
 * A store that exists on the StormContext for internal use.
 *
 * @remarks
 * Please do not use this in application code as it is likely to change
 *
 * @internal
 */
interface Internal_StormContextStore {
  /**
   * List of events that have been emitted
   *
   * @internal
   */
  events: IStormEvent[];
}

/**
 * Interface representing the global Storm Application context.
 *
 * @remarks
 * This object is injected into the global scope of the Storm Stack application. It can be accessed using the `storm` variable.
 */
export type StormContext<
  TVars extends StormEnv = StormEnv,
  TAdditionalFields extends Record<string, any> = Record<string, any>,
  TPayload extends IStormPayload = IStormPayload
> = TAdditionalFields & {
  /**
   * The name of the Storm application.
   */
  readonly name: string;

  /**
   * The version of the Storm application.
   */
  readonly version: string;

  /**
   * The variables for the Storm application.
   */
  readonly vars: TVars;

  /**
   * The runtime information for the Storm application.
   */
  readonly runtime: StormRuntimeInfo;

  /**
   * The build information for the Storm application.
   */
  readonly build: StormBuildInfo;

  /**
   * The current payload object for the Storm application.
   */
  readonly payload: TPayload;

  /**
   * The current meta object.
   */
  readonly meta: Record<string, any>;

  /**
   * The root application logger for the Storm Stack application.
   */
  readonly log: IStormLog;

  /**
   * The root [unstorage](https://unstorage.unjs.io/) storage to use for Storm Stack application.
   */
  readonly storage: Storage;

  /**
   * A function to emit an event to a processing queue.
   */
  emit: <TEvent extends IStormEvent<string, any>>(event: TEvent) => void;

  /**
   * A store that exists on the StormContext for internal use.
   *
   * @remarks
   * Please do not use this in application code as it is likely to change
   *
   * @internal
   */
  __internal: Internal_StormContextStore;
};
