#!/usr/bin/env zx
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

import { $, argv, chalk, echo } from "zx";

// usePwsh();

try {
  let configuration = argv.configuration;
  if (!configuration) {
    if (argv.prod) {
      configuration = "production";
    } else if (argv.dev) {
      configuration = "development";
    } else {
      configuration = "production";
    }
  }

  echo`${chalk.whiteBright(`🏗️  Building the monorepo in ${configuration} mode...`)}`;

  let proc = $`pnpm bootstrap`.timeout("60s");
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  let result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while bootstrapping the monorepo: \n\n${result.message}\n`
    );
  }

  proc = $`pnpm nx run nx:build:${configuration}`;
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while building the Nx plugin toolkit packages in ${configuration} mode: \n\n${result.message}\n`
    );
  }

  if (configuration === "production") {
    proc = $`pnpm nx run-many --target=build --all --exclude="@storm-stack/monorepo" --configuration=production --outputStyle=dynamic-legacy --parallel=5`;
    proc.stdout.on("data", data => {
      echo`${data}`;
    });
    result = await proc;
    if (!result.ok) {
      throw new Error(
        `An error occurred while building the monorepo in production mode: \n\n${result.message}\n`
      );
    }
  } else {
    proc = $`pnpm nx run-many --target=build --all --exclude="@storm-stack/monorepo" --configuration=${configuration} --nxBail --outputStyle=dynamic-legacy`;
    proc.stdout.on("data", data => {
      echo`${data}`;
    });
    result = await proc;
    if (!result.ok) {
      throw new Error(
        `An error occurred while building the monorepo in development mode: \n\n${result.message}\n`
      );
    }
  }

  echo`${chalk.green(`Successfully built the monorepo in ${configuration} mode!`)}`;
} catch (error) {
  echo`${chalk.red(error?.message ? error.message : "A failure occurred while building the monorepo")}`;

  process.exit(1);
}
