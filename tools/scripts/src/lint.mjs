#!/usr/bin/env zx
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

import { $, chalk, echo } from "zx";

try {
  await echo`${chalk.whiteBright("📋  Linting the monorepo...")}`;

  let proc =
    $`pnpm nx run-many --target=lint --all --exclude="@storm-stack/monorepo" --outputStyle=dynamic-legacy --parallel=5`.timeout(
      `${30 * 60}s`
    );
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  let result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while linting the monorepo: \n\n${result.message}\n`
    );
  }

  proc = $`pnpm exec storm-lint all --skip-cspell --skip-circular-deps`.timeout(
    `${30 * 60}s`
  );
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while running \`storm-lint\` on the monorepo: \n\n${result.message}\n`
    );
  }

  echo`${chalk.green("Successfully linted the monorepo's files")}`;
} catch (error) {
  echo`${chalk.red(error?.message ? error.message : "A failure occurred while linting the monorepo")}`;

  process.exit(1);
}
