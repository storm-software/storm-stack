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

import { defineUntypedSchema } from "untyped";
import stormStackPrepareExecutorSchema from "../prepare/untyped";

export default defineUntypedSchema({
  ...stormStackPrepareExecutorSchema,
  $schema: {
    id: "StormStackBuildExecutorSchema",
    title: "Storm Stack Build Executor",
    description:
      "A type definition for the Storm Stack - Build executor schema",
    required: []
  },
  skipLint: {
    $schema: {
      title: "Skip Lint",
      type: "boolean",
      description:
        "Skip the linting process ran prior to the build (if required)"
    },
    $default: false
  }
});
