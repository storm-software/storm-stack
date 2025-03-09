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

import { composer } from "eslint-flat-config-utils";
import parser from "jsonc-eslint-parser";
import baseConfig from "../../eslint.config.mjs";

export default composer(baseConfig).append({
  files: [
    "./package.json",
    "./generators.json",
    "./executors.json",
    "./generators.json",
    "./executors.json",
    "./migrations.json"
  ],
  rules: {
    "@nx/nx-plugin-checks": "error"
  },
  languageOptions: {
    parser
  }
});
