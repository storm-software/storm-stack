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

import { defineTsupConfig } from "@storm-stack/tools-config/tsup.shared";

const config = defineTsupConfig({
  name: "devkit",
  entry: [
    "src/index.ts",
    "src/types/**/*.ts",
    "src/helpers/**/*.ts",
    "src/templates/*.ts",
    "src/templates/helpers/*.ts",
    "src/templates/components/*.ts",
    "src/plugins/*.ts",
    "src/babel/*.ts"
  ],
  skipNodeModulesBundle: true
});

export default config;
