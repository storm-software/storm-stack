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

import { defineUntypedSchema } from "untyped";
import stormStackBaseExecutorSchema from "../../base/base-executor.untyped";

export default defineUntypedSchema({
  ...stormStackBaseExecutorSchema,
  $schema: {
    id: "StormStackLintExecutorSchema",
    title: "Storm Stack Lint Executor",
    description: "A type definition for the Storm Stack - Lint executor schema",
    required: []
  },
  autoPrepare: {
    $schema: {
      title: "Auto Prepare",
      type: "boolean",
      description: "Automatically prepare the project (if required)"
    },
    $default: true
  },
  autoClean: {
    $schema: {
      title: "Auto Clean",
      type: "boolean",
      description: "Automatically clean the project (if required)"
    },
    $default: true
  }
});
