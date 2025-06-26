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
import { getColor } from "@storm-software/config-tools/utilities/colors";
import { noop } from "@stryke/helpers/noop";
import chalk from "chalk";
import type { LogFn, ResolvedOptions } from "../../types";

export const createLog = (
  name: string = "",
  options: Partial<ResolvedOptions> = {}
): LogFn => {
  const logLevel = options.logLevel || LogLevelLabel.INFO;
  if (logLevel === LogLevelLabel.SILENT) {
    return noop;
  }

  if (options.customLogger) {
    return options.customLogger;
  }

  return (type: LogLevelLabel, ...args: string[]) =>
    getLogFn(getLogLevel(type), {
      ...options,
      logLevel
    })(
      `${chalk.bold.hex(getColor("brand", options))(`storm-stack${name ? `:${name}` : ""} ${chalk.gray("> ")}`)}${args.join(" ")} `
    );
};

const BADGE_COLORS = [
  "#00A0DD",
  "#6FCE4E",
  "#FBBF24",
  "#F43F5E",
  "#3B82F6",
  "#A855F7",
  "#F472B6",
  "#F59E42",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#F472B6",
  "#22D3EE",
  "#EAB308",
  "#84CC16",
  "#F87171",
  "#0EA5E9",
  "#D946EF",
  "#FACC15",
  "#34D399"
] as const;

export const extendLog = (logFn: LogFn, name: string): LogFn => {
  return (type: LogLevelLabel, ...args: string[]) =>
    logFn(
      type,
      ` ${chalk.inverse.hex(BADGE_COLORS[+name % BADGE_COLORS.length] || BADGE_COLORS[0])(` ${name} `)}  ${args.join(" ")} `
    );
};
