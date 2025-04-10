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

import { defineUntypedSchema } from "untyped";
import stormStackBaseExecutorSchema from "../../base/base-executor.untyped";

export default defineUntypedSchema({
  ...stormStackBaseExecutorSchema,
  $schema: {
    id: "StormStackDocsExecutorSchema",
    title: "Storm Stack Docs Executor",
    description: "A type definition for the Storm Stack - Docs executor schema",
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
