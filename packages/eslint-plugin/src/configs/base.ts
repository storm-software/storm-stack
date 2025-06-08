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

import type { Linter } from "eslint";
import { plugin } from "../plugin";
import { globals } from "./globals";

const config: Linter.Config = {
  files: ["**/*.{,c,m}{j,t}s{,x}"],
  name: "storm-stack:base",
  plugins: {
    "storm-stack": plugin
  },
  languageOptions: {
    globals
  },
  ignores: [".storm"],
  rules: {
    "storm-stack/async-prevent-default": "off",
    "storm-stack/format-error-codes": [
      "warn",
      { codesFile: "./tools/errors/codes.json" }
    ],
    "storm-stack/if-newline": "warn",
    "storm-stack/no-implicit-globals": "warn",
    "storm-stack/storm-urls-only": "off",
    "storm-stack/storm-json-only": "off",
    "storm-stack/storm-errors-only": "warn",
    "storm-stack/top-level-functions": "warn"
  }
};

export default config;
