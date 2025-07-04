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
  await echo`${chalk.whiteBright("🔄  Updating Storm Software packages...")}`;

  let proc = $`pnpm update "@storm-software/*" --recursive --latest`.timeout(
    `${8 * 60}s`
  );
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  let result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while updating "storm-software" packages: \n\n${result.message}\n`
    );
  }

  proc = $`pnpm dedupe`.timeout(`${8 * 60}s`);
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while deduplicating workspace dependencies: \n\n${result.message}\n`
    );
  }

  proc = $`pnpm update --recursive --workspace`.timeout(`${8 * 60}s`);
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while updating workspace pnpm package links ("XX.XX.XX" -> "workspace:*"): \n\n${result.message}\n`
    );
  }

  echo`${chalk.green("Successfully updated Storm dependency packages")}`;
} catch (error) {
  echo`${chalk.red(error?.message ? error.message : "A failure occurred while updating Storm dependency packages")}`;

  process.exit(1);
}
