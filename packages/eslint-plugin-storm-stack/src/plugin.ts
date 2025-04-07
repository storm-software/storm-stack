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

import type { ESLint } from "eslint";
import packageJson from "../package.json" with { type: "json" };
import asyncPreventDefault from "./rules/async-prevent-default";
import ifNewline from "./rules/if-newline";
import noImplicitGlobals from "./rules/no-implicit-globals";
import stormErrorsOnly from "./rules/storm-errors-only";
import stormRequestsOnly from "./rules/storm-requests-only";
import stormResponsesOnly from "./rules/storm-responses-only";
import topLevelFunctions from "./rules/top-level-functions";

export const plugin = {
  meta: {
    name: "storm-stack",
    version: packageJson.version
  },
  rules: {
    "async-prevent-default": asyncPreventDefault,
    "no-implicit-globals": noImplicitGlobals,
    "if-newline": ifNewline,
    "storm-errors-only": stormErrorsOnly,
    "storm-requests-only": stormRequestsOnly,
    "storm-responses-only": stormResponsesOnly,
    "top-level-functions": topLevelFunctions
  }
} satisfies ESLint.Plugin;
