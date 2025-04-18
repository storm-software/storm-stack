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

import type { ESLintGlobalsPropValue } from "@storm-software/eslint/types";

export const globals = {
  $storm: "readonly",
  StormURL: "readonly",
  StormError: "readonly",
  StormRequest: "readonly",
  StormResponse: "readonly",
  StormEvent: "readonly",
  StormJSON: "readonly",
  id: "readonly",
  getRandom: "readonly"
} as Record<string, ESLintGlobalsPropValue>;
