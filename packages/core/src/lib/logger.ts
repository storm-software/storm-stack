/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

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
import { titleCase } from "@stryke/string-format/title-case";
import chalk from "chalk";
import type { LogFn, ResolvedOptions, UserConfig } from "../types";

export const createLog = (
  name: string | null,
  options: Partial<
    | ResolvedOptions
    | UserConfig
    | {
        logLevel: LogLevelLabel;
        customLogger: LogFn;
      }
  > = {}
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
      `${chalk.bold.hex(
        getColor("brand", options as Parameters<typeof getColor>[1])
      )(
        `storm-stack${name ? `:${name}` : ""} ${chalk.gray("> ")}`
      )}${args.join(" ")} `.trim()
    );
};

const BADGE_COLORS = [
  "#00A0DD",
  "#6FCE4E",
  "#FBBF24",
  "#F43F5E",
  "#3B82F6",
  "#A855F7",
  "#469592",
  "#288EDF",
  "#10B981",
  "#EF4444",
  "#F0EC56",
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
      ` ${chalk.inverse.hex(
        BADGE_COLORS[
          name
            .split("")
            .map(char => char.charCodeAt(0))
            .reduce((ret, charCode) => ret + charCode, 0) % BADGE_COLORS.length
        ] || BADGE_COLORS[0]
      )(` ${titleCase(name)} `)}  ${args.join(" ")} `
    );
};
