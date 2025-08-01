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

/// <reference types="node" />

declare module "synchronous-worker" {
  declare const kHandle: unique symbol;
  declare const kProcess: unique symbol;
  declare const kModule: unique symbol;
  declare const kGlobalThis: unique symbol;
  declare const kHasOwnEventLoop: unique symbol;
  declare const kHasOwnMicrotaskQueue: unique symbol;
  declare const kPromiseInspector: unique symbol;
  declare const kStoppedPromise: unique symbol;
  interface Options {
    sharedEventLoop: boolean;
    sharedMicrotaskQueue: boolean;
  }
  declare type InspectedPromise<T> =
    | {
        state: "pending";
        value: null;
      }
    | {
        state: "fulfilled";
        value: T;
      }
    | {
        state: "rejected";
        value: Error;
      };
  declare class SynchronousWorker extends EventEmitter {
    [kHandle]: any;

    [kProcess]: NodeJS.Process;

    [kGlobalThis]: any;

    [kModule]: typeof Module;

    [kHasOwnEventLoop]: boolean;

    [kHasOwnMicrotaskQueue]: boolean;

    [kPromiseInspector]: <T>(promise: Promise<T>) => InspectedPromise<T>;

    [kStoppedPromise]: Promise<void>;

    constructor(options?: Partial<Options>);

    runLoop(mode?: "default" | "once" | "nowait"): void;

    runLoopUntilPromiseResolved<T>(promise: Promise<T>): T;

    get loopAlive(): boolean;

    stop(): Promise<void>;

    get process(): NodeJS.Process;

    get globalThis(): any;

    createRequire(
      ...args: Parameters<typeof Module.createRequire>
    ): NodeJS.Require;

    runInWorkerScope(method: () => any): any;
  }

  export = SynchronousWorker;
}
