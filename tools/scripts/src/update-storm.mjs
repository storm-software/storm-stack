#!/usr/bin/env zx
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

import { $, chalk, echo } from "zx";

try {
  await echo`${chalk.whiteBright("🔄  Updating the workspace's Storm Software dependencies and re-linking workspace packages...")}`;

  // 1) Update @storm-software/* packages to the latest version
  await echo`${chalk.whiteBright("Checking for @storm-software/* updates...")}`;
  let proc =
    $`pnpm update --filter "@storm-software/*" --recursive --latest`.timeout(
      `${8 * 60}s`
    );
  proc.stdout.on("data", data => echo`${data}`);
  let result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while updating "@storm-software/*" packages:\n\n${result.message}\n`
    );
  }

  // 2) Update @stryke/* packages to the latest version
  await echo`${chalk.whiteBright("Checking for @stryke/* updates...")}`;
  proc = $`pnpm update --filter "@stryke/*" --recursive --latest`.timeout(
    `${8 * 60}s`
  );
  proc.stdout.on("data", data => echo`${data}`);
  result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while updating "@stryke/*" packages:\n\n${result.message}\n`
    );
  }

  // 3) Dedupe all workspace dependencies
  proc = $`pnpm dedupe`.timeout(`${8 * 60}s`);
  proc.stdout.on("data", data => echo`${data}`);
  result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while deduplicating workspace dependencies:\n\n${result.message}\n`
    );
  }

  // 4) Ensure workspace:* links are up to date
  proc = $`pnpm update --recursive --workspace`.timeout(`${8 * 60}s`);
  proc.stdout.on("data", data => echo`${data}`);
  result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while refreshing workspace links:\n\n${result.message}\n`
    );
  }

  echo`${chalk.green("✅  Successfully updated Storm Software package dependencies and re-linked workspace packages")}\n\n`;
} catch (error) {
  echo`${chalk.red(
    error?.message ??
      "A failure occurred while updating Stryke/Storm dependency packages"
  )}`;
  process.exit(1);
}
