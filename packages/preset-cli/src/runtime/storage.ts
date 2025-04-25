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

import { getFileHeader } from "@storm-stack/core/helpers";
import type { Context, Options } from "@storm-stack/core/types";
import { joinPaths } from "@stryke/path/join-paths";
import type { StormStackCLIPresetConfig } from "../types/config";

export function writeStorage<TOptions extends Options = Options>(
  context: Context<TOptions>,
  config: StormStackCLIPresetConfig
) {
  return `${getFileHeader()}

import { createStorage } from "unstorage";
import fsLiteDriver from "unstorage/drivers/fs-lite";

export const storage = createStorage();
storage.mount("logs", fsLiteDriver({ base: "${config.logPath || context.envPaths.log || joinPaths("/var/log", context.name || "storm-software")}" }));
`;
}
