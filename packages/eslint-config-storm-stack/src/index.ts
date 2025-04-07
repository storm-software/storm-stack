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

/**
 * The devkit-eslint-config library used by Storm Software for building NodeJS applications.
 *
 * @remarks
 * A package containing shared ESLint configuration used by Storm Stack projects.
 *
 * @packageDocumentation
 */

import { getConfig } from "./preset";

const config = getConfig({
  "@storm-stack/core": "recommended"
});

export default config;
