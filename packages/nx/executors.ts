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

export { executorFn as stormStackBuildExecutor } from "./src/executors/build/executor";
export type { StormStackBuildExecutorSchema } from "./src/executors/build/schema.d";
export { executorFn as stormStackCleanExecutor } from "./src/executors/clean/executor";
export type { StormStackCleanExecutorSchema } from "./src/executors/clean/schema.d";
export { executorFn as stormStackDocsExecutor } from "./src/executors/docs/executor";
export type { StormStackDocsExecutorSchema } from "./src/executors/docs/schema.d";
export { executorFn as stormStackLintExecutor } from "./src/executors/lint/executor";
export type { StormStackLintExecutorSchema } from "./src/executors/lint/schema.d";
export { executorFn as stormStackPrepareExecutor } from "./src/executors/prepare/executor";
export type { StormStackPrepareExecutorSchema } from "./src/executors/prepare/schema.d";
