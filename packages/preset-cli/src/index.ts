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

import { LogLevelLabel } from "@storm-software/config-tools/types";

import { Preset } from "@storm-stack/core/preset";
import type { Context, EngineHooks, Options } from "@storm-stack/core/types";
import { unbuild } from "@storm-stack/devkit/helpers/unbuild/build";

import { esbuild } from "@storm-stack/devkit/helpers/esbuild/build";
import { initContext, initEntry } from "./helpers/init";
import { prepareEntry, prepareRuntime } from "./helpers/prepare";
import type { StormStackCLIPresetConfig } from "./types/config";

export default class StormStackCLIPreset<
  TOptions extends Options = Options
> extends Preset<TOptions> {
  #config: StormStackCLIPresetConfig;

  public constructor(config: Partial<StormStackCLIPresetConfig> = {}) {
    super("cli", "@storm-stack/preset-cli");

    this.#config = config;
    this.dependencies = [
      [
        "@storm-stack/plugin-log-console",
        {
          logLevel: "info"
        }
      ]
    ];
  }

  public addHooks(hooks: EngineHooks<TOptions>) {
    hooks.addHooks({
      "init:context": this.initContext.bind(this),
      "init:entry": this.initEntry.bind(this),
      "prepare:entry": this.prepareEntry.bind(this),
      "prepare:runtime": this.prepareRuntime.bind(this),
      "build:library": this.buildLibrary.bind(this),
      "build:application": this.buildApplication.bind(this)
    });
  }

  protected async initContext(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing CLI specific options for the Storm Stack project.`
    );

    await initContext(this.log, context);
  }

  protected async initEntry(context: Context<TOptions>) {
    if (context.options.projectType === "application") {
      this.log(
        LogLevelLabel.TRACE,
        `Initializing CLI application's entry point and commands.`
      );

      await initEntry(this.log, context, this.#config);
    }
  }

  protected async prepareRuntime(context: Context<TOptions>) {
    if (context.options.projectType === "application") {
      await prepareRuntime(this.log, context);
    }
  }

  protected async prepareEntry(context: Context<TOptions>) {
    if (context.options.projectType === "application") {
      this.log(
        LogLevelLabel.TRACE,
        `Preparing the CLI application's entry point and commands.`
      );

      await prepareEntry(this.log, context, this.#config);
    }
  }

  protected async buildLibrary(context: Context<TOptions>) {
    return unbuild(context);
  }

  protected async buildApplication(context: Context<TOptions>) {
    return esbuild(context);
  }
}
