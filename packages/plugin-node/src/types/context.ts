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

import type { AsyncLocalStorage } from "node:async_hooks";

export interface UseContext<T> {
  /**
   * Get the current context. Throws if no context is set.
   */
  use: () => T;
  /**
   * Get the current context. Returns `null` when no context is set.
   */
  tryUse: () => T | null;
  /**
   * Set the context as Singleton Pattern.
   */
  set: (instance?: T, replace?: boolean) => void;
  /**
   * Clear current context.
   */
  unset: () => void;
  /**
   * Exclude a synchronous function with the provided context.
   */
  call: <R>(instance: T, callback: () => R) => R;
  /**
   * Exclude an asynchronous function with the provided context.
   * Requires installing the transform plugin to work properly.
   */
  callAsync: <R>(instance: T, callback: () => R | Promise<R>) => Promise<R>;
}

export type OnAsyncRestore = () => void;
export type OnAsyncLeave = () => void | OnAsyncRestore;

export interface ContextOptions {
  asyncContext?: boolean;
  AsyncLocalStorage?: typeof AsyncLocalStorage;
}

export interface ContextNamespace {
  get: <T>(key: string, opts?: ContextOptions) => UseContext<T>;
}
