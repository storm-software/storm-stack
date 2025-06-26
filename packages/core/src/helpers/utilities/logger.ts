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

import { getLogFn, getLogLevel } from "@storm-software/config-tools/logger";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { noop } from "@stryke/helpers/noop";
import chalkTemplate from "chalk-template";
import type { InlineConfig, LogFn, WorkspaceConfig } from "../../types";

export const createLog = (
  name: string = "",
  inlineConfig: Partial<Pick<InlineConfig, "logLevel" | "customLogger">> = {},
  workspaceConfig: Partial<WorkspaceConfig> = {}
): LogFn => {
  const logLevel =
    inlineConfig.logLevel || workspaceConfig.logLevel || LogLevelLabel.INFO;
  if (logLevel === LogLevelLabel.SILENT) {
    return noop;
  }

  if (inlineConfig.customLogger) {
    return inlineConfig.customLogger;
  }

  return (type: LogLevelLabel, ...args: string[]) =>
    getLogFn(getLogLevel(type), {
      ...workspaceConfig,
      logLevel
    })(
      chalkTemplate`{bold.#6FCE4E storm-stack${name ? `:${name}` : ""} > }${args.join(" ")} `
    );
};
