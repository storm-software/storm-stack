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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { joinPaths } from "@stryke/path/join-paths";
import type { Context, Options } from "../../types/build";
import type { LogFn } from "../../types/config";
import { writeFile } from "../utilities/write-file";

export async function writeDefaultEslintConfig<
  TOptions extends Options = Options
>(
  log: LogFn,
  context: Context<TOptions>,
  type: "base" | "recommended" | "strict" = "recommended"
) {
  const eslintConfigFile = joinPaths(
    context.workspaceConfig.workspaceRoot,
    "eslint.config.js"
  );
  const eslintConfig = `
import { getConfig } from "eslint-config-storm-stack";

Error.stackTraceLimit = Number.POSITIVE_INFINITY;

export default getConfig({
  repositoryName: "${context.workspaceConfig.name || context.name || "storm-stack"}",
  "storm-stack": "${type}",
});
`;

  log(
    LogLevelLabel.INFO,
    `Writing a default ESLint config file to ${eslintConfigFile}`
  );
  return writeFile(log, eslintConfigFile, eslintConfig);
}
