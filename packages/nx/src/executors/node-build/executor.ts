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

import { withRunExecutor } from "@storm-software/workspace-tools";
import { createBuildExecutor } from "../../base/build-executor";
import type { StormStackNodeBuildExecutorSchema } from "./schema";

export const executorFn = createBuildExecutor(["@storm-stack/plugin-node"]);

export default withRunExecutor<StormStackNodeBuildExecutorSchema>(
  "Storm Stack NodeJs build executor",
  executorFn,
  {
    skipReadingConfig: false,
    hooks: {
      applyDefaultOptions: (options: StormStackNodeBuildExecutorSchema) => {
        options.entry ??= "{sourceRoot}/index.ts";

        return options;
      }
    }
  }
);
