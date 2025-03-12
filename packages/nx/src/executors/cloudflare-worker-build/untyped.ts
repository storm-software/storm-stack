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
import stormStackAppBuildExecutorSchema from "../../base/build-executor.untyped";

export default defineUntypedSchema({
  ...stormStackAppBuildExecutorSchema,
  $schema: {
    id: "CloudflareWorkerBuildExecutorSchema",
    title: "Storm Stack Cloudflare Worker Build Executor",
    description:
      "A type definition for the Cloudflare Worker application build executor schema",
    required: []
  }
});
