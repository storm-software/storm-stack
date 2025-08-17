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

import { Driver, Storage } from "unstorage";

/**
 * The Storm Storage Interface extends the [Unstorage](https://unstorage.unjs.io/) Storage interface with additional functionality specific to the Storm Stack.
 *
 * @see https://unstorage.unjs.io/
 *
 * @remarks
 * This interface adds the ability to initialize the storage adapters and provides a consistent API for interacting with the storage layer.
 */
export type StormStorageInterface = Storage & AsyncDisposable;

/**
 * A storage adapter is an instance of a {@link Driver} used by [Unstorage](https://unstorage.unjs.io/).
 */
export type StorageAdapter = Driver & AsyncDisposable;

/**
 * A factory function that creates a storage adapter.
 *
 * @remarks
 * The created storage adapter will be used to interact with the storage layer in the application. This function is expected to be the default export of the storage plugin's module.
 *
 * @returns The created {@link StorageAdapter}.
 */
export type StorageAdapterFactory = () => StorageAdapter;
