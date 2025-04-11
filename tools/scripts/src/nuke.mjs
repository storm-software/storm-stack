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

// usePwsh();

try {
  echo`${chalk.whiteBright("💣  Nuking the monorepo...")}`;

  let proc = $`pnpm nx clear-cache`.timeout(`${5 * 60}s`);
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  let result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while clearing Nx cache: \n\n${result.message}\n`
    );
  }

  proc = $`rm -rf ./.nx/cache ./.nx/workspace-data ./dist ./tmp`.timeout(
    `${5 * 60}s`
  );
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while removing cache directories: \n\n${result.message}\n`
    );
  }

  proc = $`rm -rf ./packages/*/node_modules`.timeout(`${5 * 60}s`);
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while removing node modules and build directories from the monorepo's projects: \n\n${result.message}\n`
    );
  }

  proc = $`rm -rf ./tools/*/node_modules`.timeout(`${5 * 60}s`);
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while removing node modules and build directories from the monorepo's projects: \n\n${result.message}\n`
    );
  }

  proc = $`rm -rf ./node_modules`.timeout(`${5 * 60}s`);
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while removing node modules and build directories from the monorepo's projects: \n\n${result.message}\n`
    );
  }

  echo`${chalk.green("Successfully nuked the cache, node modules, and build folders \n\n")}`;
} catch (error) {
  echo`${chalk.red(error?.message ? error.message : "A failure occurred while nuking the monorepo")}`;
}
