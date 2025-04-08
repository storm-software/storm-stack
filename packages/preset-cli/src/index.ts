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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { Preset } from "@storm-stack/core/preset";
import type { Context, EngineHooks, Options } from "@storm-stack/core/types";

import type { StormStackCLIPresetConfig } from "./types/config";

export default class StormStackCLIPreset<
  TOptions extends Options = Options
> extends Preset<TOptions> {
  #config: StormStackCLIPresetConfig;

  public override dependencies = ["@storm-stack/plugin-node"];

  public constructor(config: StormStackCLIPresetConfig) {
    super("cli", "@storm-stack/preset-cli");

    this.#config = config;
  }

  public addHooks(hooks: EngineHooks<TOptions>) {
    hooks.addHooks({
      "init:context": this.initContext.bind(this),
      "init:installs": this.initInstalls.bind(this)
    });
  }

  protected async initContext(_context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing CLI specific options for the Storm Stack project.`
    );

    // const binaryName =
    //   this.#config.binaryName || kebabCase(context.name || "cli");
    // context.artifactsDir = joinPaths(
    //   context.projectRoot,
    //   this.#config.binaryPath
    // );
    // context.runtimeDir = joinPaths(context.artifactsDir, "runtime");
    // context.resolvedEntry = context.resolvedEntry.map(entry => ({
    //   ...entry,
    //   file: joinPaths(this.#config.binaryPath, entry.file)
    // }));
  }

  protected async initInstalls(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Running required installations for the project.`
    );

    await Promise.all(
      [
        this.install(context, "@stryke/cli"),
        context.projectType === "application" &&
          this.install(context, "consola")
      ].filter(Boolean)
    );
  }

  //   protected async prepareEntry(context: Context<TOptions>) {
  //     await Promise.all(
  //       context.resolvedEntry.map(async entry => {
  //         this.log(
  //           LogLevelLabel.TRACE,
  //           `Preparing the entry artifact ${entry.file} (${entry?.name ? `export: "${entry.name}"` : "default"})" from input "${entry.input.file} (${entry.input.name ? `export: "${entry.input.name}"` : "default"})"`
  //         );

  //         return this.writeFile(
  //           entry.file,
  //           `#!/usr/bin/env node
  // ${getFileHeader()}

  // import ${entry.input.name ? `{ ${entry.input.name} as handle }` : "handle"} from "${joinPaths(
  //             relativePath(
  //               joinPaths(context.projectRoot, findFilePath(entry.file)),
  //               joinPaths(context.projectRoot, findFilePath(entry.input.file))
  //             ),
  //             findFileName(entry.input.file).replace(
  //               findFileExtension(entry.input.file),
  //               ""
  //             )
  //           )}";

  // import { builder } from ".${joinPaths(
  //             context.runtimeDir.replace(context.artifactsDir, ""),
  //             "app"
  //           )}";
  // import { getSink } from "@storm-stack/log-console";

  // export default {
  //   fetch: builder({
  //     name: ${context.name ? `"${context.name}"` : "undefined"},
  //     log: { handle: getSink(), logLevel: "debug" },
  //   })
  //     .handler(handle)
  //     .build()
  // }

  //  `
  //         );
  //       })
  //     );
  //   }
}
