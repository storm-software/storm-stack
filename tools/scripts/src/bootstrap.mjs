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

import { build } from "esbuild";
import { $, chalk, echo } from "zx";

try {
  echo`${chalk.whiteBright("⚙️  Bootstrapping the monorepo...")}`;

  await build({
    entryPoints: ["tools/nx/src/plugins/plugin.ts"],
    target: "node22",
    outdir: "dist/plugins",
    tsconfig: "tools/nx/tsconfig.json",
    packages: "bundle",
    external: ["nx", "@nx/devkit"],
    logLevel: "info",
    bundle: true,
    minify: false,
    format: "esm",
    platform: "node"
  });

  const proc = $`pnpm nx reset --onlyDaemon`.timeout(`${2 * 60}s`);
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  const result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while resetting the Nx daemon process: \n\n${result.message}\n`
    );
  }

  echo`${chalk.green("Completed monorepo bootstrapping successfully!")}`;
} catch (error) {
  echo`${chalk.red(error?.message ? error.message : "A failure occurred while bootstrapping the monorepo")}`;

  process.exit(1);
}
