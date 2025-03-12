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

import { $, argv, chalk, echo, spinner, usePwsh } from "zx";

usePwsh();

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

  await spinner(
    `${chalk.whiteBright(`
Building the monorepo in ${configuration} mode...
`)}`,
    async () => {
      let result = await $`pnpm bootstrap`.timeout("60s");
      if (!result.ok) {
        throw new Error(
          `An error occured while bootstrapping the monorepo: \n\n${result.message}\n`
        );
      }

      if (configuration === "production") {
        result =
          await $`pnpm nx run-many --target=build --all --exclude="@storm-stack/monorepo" --configuration=production --parallel=5`;
        if (!result.ok) {
          throw new Error(
            `An error occured while building the monorepo in production mode: \n\n${result.message}\n`
          );
        }
      } else {
        result =
          await $`pnpm nx run-many --target=build --all --exclude="@storm-stack/monorepo" --configuration=${configuration} --nxBail`;
        if (!result.ok) {
          throw new Error(
            `An error occured while building the monorepo in development mode: \n\n${result.message}\n`
          );
        }
      }
    }
  );

  echo`${chalk.green(`Successfully built the monorepo in ${configuration} mode!`)}`;
} catch (error) {
  echo`${chalk.red(error?.message ? error.message : "A failure occured while building the monorepo")}`;

  process.exit(1);
}
