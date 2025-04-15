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
import recommended from "./recommended";

const config: Linter.Config = {
  files: recommended.files,
  name: "storm-stack:strict",
  plugins: recommended.plugins,
  languageOptions: recommended.languageOptions,
  ignores: recommended.ignores,
  rules: {
    "storm-stack/async-prevent-default": "error",
    "storm-stack/format-error-codes": "error",
    "storm-stack/if-newline": "error",
    "storm-stack/no-implicit-globals": "error",
    "storm-stack/storm-urls-only": "error",
    "storm-stack/storm-json-only": "error",
    "storm-stack/storm-errors-only": "error",
    "storm-stack/storm-requests-only": "error",
    "storm-stack/storm-responses-only": "error",
    "storm-stack/top-level-functions": "error"
  }
};

export default config;
