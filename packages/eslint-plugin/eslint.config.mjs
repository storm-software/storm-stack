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

import { fixupPluginRules } from "@eslint/compat";
import { composer } from "eslint-flat-config-utils";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import i18nTextPlugin from "eslint-plugin-i18n-text";
import globals from "globals";
import baseConfig from "../../eslint.config.mjs";

export default composer(baseConfig).append({
  languageOptions: {
    ecmaVersion: 13,
    globals: {
      ...globals.es6,
      ...globals.node
    }
  },
  plugins: {
    "eslint-plugin": eslintPlugin,
    "i18n-text": fixupPluginRules(i18nTextPlugin)
  },
  rules: {
    "import/extensions": "off",
    "import/no-commonjs": "off",
    "i18n-text/no-en": "off",
    "eslint-plugin/prefer-placeholders": "off",
    "eslint-plugin/test-case-shorthand-strings": "off",
    "eslint-plugin/require-meta-docs-url": "off"
  },
  ignores: ["docs/rules/**/*.md"]
});
