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
import stormStackBaseExecutorSchema from "./base-executor.untyped";

export default defineUntypedSchema({
  ...stormStackBaseExecutorSchema,
  $schema: {
    id: "StormStackBuildExecutorSchema",
    title: "Storm Stack Build Executor",
    description:
      "A type definition for the base Storm Stack build executor schema",
    required: []
  },
  entry: {
    $schema: {
      title: "Entry File",
      type: "string",
      description: "The entry file or files to build"
    },
    $default: "{sourceRoot}/index.ts"
  },
  mode: {
    $schema: {
      title: "Mode",
      type: "string",
      description: "The build mode",
      enum: ["development", "staging", "production"]
    },
    $default: "production"
  }
});
