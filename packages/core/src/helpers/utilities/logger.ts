/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getLogFn, getLogLevel } from "@storm-software/config-tools/logger";
import type { LogLevelLabel } from "@storm-software/config-tools/types";
import { noop } from "@stryke/helpers/noop";
import chalkTemplate from "chalk-template";
import type { LogFn, Options } from "../../types";

export const createLog = (
  name: string = "",
  options: Partial<Pick<Options, "silent">> = {}
): LogFn => {
  if (options.silent) {
    return noop;
  }

  return (type: LogLevelLabel, ...args: string[]) =>
    getLogFn(getLogLevel(type))(
      chalkTemplate`{bold.#6FCE4E storm-stack${name ? `:${name}` : ""} > }${args.join(" ")} `
    );
};
