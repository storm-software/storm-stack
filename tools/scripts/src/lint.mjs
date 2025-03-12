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
  let result =
    await $`pnpm nx run-many --target=lint --all --exclude="@storm-stack/monorepo" --parallel=5`.timeout(
      `${30 * 60}s`
    );
  if (!result.ok) {
    throw new Error(
      `An error occured while linting the monorepo: \n\n${result.message}\n`
    );
  }

  result =
    await $`pnpm exec storm-lint all --skip-cspell --skip-circular-deps`.timeout(
      `${30 * 60}s`
    );
  if (!result.ok) {
    throw new Error(
      `An error occured while running \`storm-lint\` on the monorepo: \n\n${result.message}\n`
    );
  }

  echo`${chalk.green("Successfully formatted the monorepo's files")}`;
} catch (error) {
  echo`${chalk.red(error?.message ? error.message : "A failure occured while linting the monorepo")}`;

  process.exit(1);
}
