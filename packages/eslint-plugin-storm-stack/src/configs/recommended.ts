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

import type { Linter } from "eslint";
import base from "./base";

const config: Linter.Config = {
  files: base.files,
  name: "storm-stack:recommended",
  plugins: base.plugins,
  languageOptions: base.languageOptions,
  ignores: base.ignores,
  rules: {
    "storm-stack/async-prevent-default": "warn",
    "storm-stack/format-error-codes": [
      "error",
      { codesFile: "./tools/errors/codes.json" }
    ],
    "storm-stack/if-newline": "warn",
    "storm-stack/no-implicit-globals": "error",
    "storm-stack/storm-urls-only": "warn",
    "storm-stack/storm-json-only": "warn",
    "storm-stack/storm-errors-only": "error",
    "storm-stack/storm-requests-only": "error",
    "storm-stack/storm-responses-only": "error",
    "storm-stack/top-level-functions": "error"
  }
};

export default config;
