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

import { $, chalk, echo, usePwsh } from "zx";

usePwsh();

try {
  let result = await $`pnpm nx clear-cache`.timeout(`${5 * 60}s`);
  if (!result.ok) {
    throw new Error(
      `An error occured while clearing Nx cache: \n\n${result.message}\n`
    );
  }

  result =
    await $`pnpm exec rimraf --no-interactive -- ./.nx/cache ./.nx/workspace-data ./dist ./tmp ./pnpm-lock.yaml`.timeout(
      `${5 * 60}s`
    );
  if (!result.ok) {
    throw new Error(
      `An error occured while removing cache directories: \n\n${result.message}\n`
    );
  }

  result =
    await $`pnpm exec rimraf --no-interactive --glob "*/**/{node_modules,dist,.storm}`.timeout(
      `${5 * 60}s`
    );
  if (!result.ok) {
    throw new Error(
      `An error occured while removing node modules and build directories from the monorepo's projects: \n\n${result.message}\n`
    );
  }

  result =
    await $`pnpm exec rimraf --no-interactive --glob "./node_modules/!rimraf/**"`.timeout(
      `${5 * 60}s`
    );
  if (!result.ok) {
    throw new Error(
      `An error occured while removing node modules from the workspace root: \n\n${result.message}\n`
    );
  }

  echo`${chalk.green("Successfully nuked the cache, node modules, and build folders")}`;
} catch (error) {
  echo`${chalk.red(error?.message ? error.message : "A failure occured while nuking the monorepo")}`;

  process.exit(1);
}
