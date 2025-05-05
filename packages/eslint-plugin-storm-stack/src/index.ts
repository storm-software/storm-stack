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
import { configs } from "./configs";
import { plugin } from "./plugin";

/**
 * A shared ESLint configuration containing globals used in Storm Stack projects
 *
 * @packageDocumentation
 * This package contains the ESLint plugin for Storm Stack, which provides
 * a set of rules and configurations for linting JavaScript and TypeScript code.
 * It includes a set of recommended rules, as well as a strict configuration
 * that enforces a more opinionated style. The plugin is designed to be used
 * with ESLint, a popular linting tool for JavaScript and TypeScript.
 *
 * This package also includes additional utilities for enhancing the linting
 * experience and ensuring code quality across projects.
 */

export default {
  ...plugin,
  configs
};

type RuleDefinitions = (typeof plugin)["rules"];

export type RuleOptions = {
  [K in keyof RuleDefinitions]: RuleDefinitions[K]["defaultOptions"];
};

export type Rules = {
  [K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>;
};
