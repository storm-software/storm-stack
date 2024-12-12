/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import { getStormConfig } from "@storm-software/eslint";

export default getStormConfig({
  name: "storm-stack",
  rules: {
    "unicorn/no-null": 0,
    "react/require-default-props": 0,
    "unicorn/no-useless-switch-case": 0,
    "react/jsx-closing-bracket-location": 0,
    "no-undef": 0,
    "no-unused-vars": "warn",
    "no-redeclare": 0,
    "unicorn/consistent-function-scoping": 0,
    "class-methods-use-this": 0,
    "operator-linebreak": 0,
    "indent": 0,
    "function-paren-newline": 0,
    "space-before-function-paren": 0
  },
  markdown: true,
  react: false,
  typescriptEslintConfigType: "base",
  useUnicorn: true
});
