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

import { StormPayloadInterface, StormStorageInterface } from "../shared";
import { StormConfigInterface } from "../shared/config";
import { StormLogInterface } from "../shared/log";
import { StormEnvInterface } from "./env";
import { StormEventInterface } from "./event";

/**
 * A store that exists on the {@link StormContextInterface} for internal use.
 *
 * @remarks
 * Please do not use this in application code as it is likely to change
 *
 * @internal
 */
// eslint-disable-next-line ts/naming-convention
interface Internal_StormContextStore {
  /**
   * List of events that have been emitted
   *
   * @internal
   */
  events: StormEventInterface[];
}

/**
 * The configuration parameters for the Storm application.
 *
 * @internal
 */
export type StormConfigContext<
  TConfig extends StormConfigInterface = StormConfigInterface
> = TConfig & {
  /**
   * A virtual object representing the configuration parameters for the Storm application at build time. The Storm Stack build process will inject this object's values with the actual configuration parameters at build time.
   *
   * @example
   * ```typescript
   * // "$storm.config.static.CONFIG_ITEM" will be replaced with the actual value at build time
   * const value = $storm.config.static.CONFIG_ITEM;
   *
   * const someNumber = $storm.config.static.SOME_NUMBER;
   * // const someNumber = 42;
   *
   * const someString = $storm.config.static.SOME_STRING;
   * // const someString = "Hello, World!";
   *
   * const someBoolean = $storm.config.static.SOME_BOOLEAN;
   * // const someBoolean = true;
   * ```
   *
   * @remarks
   * A static representation of the configuration thats used to inject data into the application code at build time. This object will can provide type safety and autocompletion for the configuration values when used in the application code. **The values on this object will not exist at runtime.**
   */
  static: TConfig;
};

/**
 * The global Storm Stack application context. This object contains information related to the current process's execution.
 *
 * @remarks
 * The Storm Stack application context object is injected into the global scope of the application. It can be accessed using `$storm` or `useStorm()` in the application code.
 */
export interface StormContextInterface<
  TConfig extends StormConfigInterface = StormConfigInterface,
  TEnv extends StormEnvInterface = StormEnvInterface,
  TMeta extends Record<string, any> = Record<string, any>
> {
  /**
   * The name of the Storm application.
   */
  readonly name: string;

  /**
   * The version of the Storm application.
   */
  readonly version: string;

  /**
   * The current meta object.
   */
  readonly meta: TMeta;

  /**
   * The unique ID for the current request.
   */
  readonly payload: StormPayloadInterface;

  /**
   * The environment information for the Storm application.
   */
  env: TEnv;

  /**
   * The configuration parameters for the Storm application.
   */
  config: StormConfigContext<TConfig>;

  /**
   * The root application logger for the Storm Stack application.
   */
  log: StormLogInterface;

  /**
   * The {@link StormStorageInterface} instance used by the Storm Stack application.
   */
  storage: StormStorageInterface;

  /**
   * A function to emit an event to a processing queue.
   */
  emit: <TEvent extends StormEventInterface<string, Record<string, any>>>(
    event: TEvent
  ) => void;

  /**
   * A set of disposable resources to clean up when the context is no longer needed.
   */
  disposables: Set<Disposable>;

  /**
   * A set of asynchronous disposable resources to clean up when the context is no longer needed.
   */
  asyncDisposables: Set<AsyncDisposable>;

  /**
   * A store that exists on the StormContext for internal use.
   *
   * @remarks
   * Please do not use this in application code as it is likely to change
   *
   * @internal
   */
  __internal: Internal_StormContextStore;
}
