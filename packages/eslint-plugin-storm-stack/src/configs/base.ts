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
    "storm-stack/if-newline": "off",
    "storm-stack/no-implicit-globals": "warn",
    "storm-stack/storm-json-only": "warn",
    "storm-stack/storm-errors-only": "warn",
    "storm-stack/storm-requests-only": "warn",
    "storm-stack/storm-responses-only": "warn",
    "storm-stack/top-level-functions": "warn"
  }
};

export default config;
