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

import type { ESLint } from "eslint";
import packageJson from "../package.json" with { type: "json" };
import asyncPreventDefault from "./rules/async-prevent-default";
import formatErrorCodes from "./rules/format-error-codes";
import ifNewline from "./rules/if-newline";
import noImplicitGlobals from "./rules/no-implicit-globals";
import stormErrorsOnly from "./rules/storm-errors-only";
import stormJSONOnly from "./rules/storm-json-only";
import stormURLsOnly from "./rules/storm-urls-only";
import topLevelFunctions from "./rules/top-level-functions";

export const plugin = {
  meta: {
    name: "storm-stack",
    version: packageJson.version
  },
  rules: {
    "async-prevent-default": asyncPreventDefault,
    "format-error-codes": formatErrorCodes,
    "no-implicit-globals": noImplicitGlobals,
    "if-newline": ifNewline,
    "storm-urls-only": stormURLsOnly,
    "storm-json-only": stormJSONOnly,
    "storm-errors-only": stormErrorsOnly,
    "top-level-functions": topLevelFunctions
  }
} satisfies ESLint.Plugin;
