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

import prettierConfig from "@storm-software/prettier";
import prettier from "prettier";

/** @type {import('eslint-doc-generator').GenerateOptions} */
const config = {
  postprocess: content =>
    prettier.format(content, { ...prettierConfig, parser: "markdown" }),
  configEmoji: [
    ["base", "📋"],
    ["recommended", "🌟"],
    ["strict", "🔒"]
  ],
  ruleDocSectionInclude: ["Rule Details", "Version"]
};

export default config;
