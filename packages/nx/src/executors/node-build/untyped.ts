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
import stormStackBuildExecutorSchema from "../../base/build-executor.untyped";

export default defineUntypedSchema({
  ...stormStackBuildExecutorSchema,
  $schema: {
    id: "NodeBuildExecutorSchema",
    title: "Storm Stack Node Build Executor",
    description: "A type definition for the NodeJs build executor schema",
    required: []
  }
});
