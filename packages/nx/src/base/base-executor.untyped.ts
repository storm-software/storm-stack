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

import baseExecutorSchema from "@storm-software/workspace-tools/base/base-executor.untyped";
import { defineUntypedSchema } from "untyped";

export default defineUntypedSchema({
  ...baseExecutorSchema,
  $schema: {
    id: "StormStackBaseExecutorSchema",
    title: "Storm Stack Base Executor",
    description:
      "A shared/base schema type definition for Storm Stack executors",
    required: []
  },
  tsconfig: {
    $schema: {
      title: "TypeScript Configuration File",
      type: "string",
      format: "path",
      description: "The path to the tsconfig file"
    },
    $default: "{projectRoot}/tsconfig.json"
  },
  skipInstalls: {
    $schema: {
      title: "Skip Installs",
      type: "boolean",
      description: "Skip installing dependencies during prepare stage"
    }
  },
  skipCache: {
    $schema: {
      title: "Skip Cache",
      type: "boolean",
      description: "Skip the cache when building"
    }
  },
  silent: {
    $schema: {
      title: "Silent",
      type: "boolean",
      description:
        "Should the build run silently - only report errors back to the user"
    },
    $default: false
  }
});
