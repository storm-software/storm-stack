#!/usr/bin/env zx
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

import { $, chalk, echo } from "zx";

try {
  await echo`${chalk.whiteBright("📋  Upgrading Storm Software packages...")}`;

  let proc = $`pnpm update "@storm-software/*" --latest`.timeout(`${30 * 60}s`);
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  let result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while upgrading "storm-software" packages: \n\n${result.message}\n`
    );
  }

  proc = $`pnpm update "@stryke/*" --latest`.timeout(`${30 * 60}s`);
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while upgrading "stryke" packages: \n\n${result.message}\n`
    );
  }

  proc = $`pnpm update "@cyclone-ui/*" --latest`.timeout(`${30 * 60}s`);
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while upgrading "cyclone-ui" packages: \n\n${result.message}\n`
    );
  }

  echo`${chalk.green("Successfully upgraded Storm dependency packages")}`;
} catch (error) {
  echo`${chalk.red(error?.message ? error.message : "A failure occurred while upgrading Storm dependency packages")}`;

  process.exit(1);
}
