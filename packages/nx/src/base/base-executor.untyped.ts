/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

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
    required: ["entry"]
  },
  entry: {
    $schema: {
      title: "Entry File",
      type: "string",
      format: "path",
      description: "The entry file or files to build"
    },
    $default: "{sourceRoot}/index.ts"
  },
  plugins: {
    $schema: {
      title: "Plugins",
      type: "array",
      description: "A list of plugins to use during Storm Stack processing",
      items: { type: "string" }
    },
    $default: []
  },
  mode: {
    $schema: {
      title: "Mode",
      type: "string",
      description: "The build mode",
      enum: ["development", "staging", "production"]
    }
  },
  environment: {
    $schema: {
      title: "Environment",
      type: "string",
      description: "The environment name for which the project is being built."
    }
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
  skipLint: {
    $schema: {
      title: "Skip Lint",
      type: "boolean",
      description: "Skip linting the project when building"
    }
  },
  logLevel: {
    $schema: {
      title: "Log Level",
      type: "string",
      description: "The log level to use for the build process",
      enum: [
        "error",
        "success",
        "silent",
        "fatal",
        "warn",
        "info",
        "debug",
        "trace",
        "all"
      ]
    }
  }
});
