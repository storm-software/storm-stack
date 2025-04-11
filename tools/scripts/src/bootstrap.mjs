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

import { build } from "esbuild";
import { $, chalk, echo } from "zx";

// usePwsh();

try {
  echo`${chalk.whiteBright("⚙️  Bootstrapping the monorepo...")}`;

  await build({
    entryPoints: [
      "tools/nx/src/plugins/plugin.ts",
      "tools/nx/src/plugins/adapter.ts"
    ],
    target: "node22",
    outdir: "dist/plugins",
    tsconfig: "tools/nx/tsconfig.json",
    packages: "bundle",
    external: ["nx", "@nx/devkit"],
    logLevel: "info",
    bundle: true,
    minify: false,
    format: "esm",
    platform: "node",
    preserveSymlinks: true
  });

  const proc = $`pnpm nx reset`.timeout(`${5 * 60}s`);
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  const result = await proc;
  if (!result.ok) {
    throw new Error(
      `An error occurred while resetting the Nx deamon process: \n\n${result.message}\n`
    );
  }

  echo`${chalk.green("Completed monorepo bootstrapping successfully!")}`;
} catch (error) {
  echo`${chalk.red(error?.message ? error.message : "A failure occurred while bootstrapping the monorepo")}`;

  process.exit(1);
}
