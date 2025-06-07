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
import type {
  EngineHooks,
  Options,
  PluginConfig
} from "@storm-stack/core/types";
import { isSetString } from "@stryke/type-checks/is-set-string";
import {
  buildApplication,
  buildLibrary,
  permissionExecutable
} from "./helpers/build";
import {
  initContext,
  initEntry,
  initInstalls,
  initUnimport
} from "./helpers/init";
import { prepareEntry, prepareRuntime } from "./helpers/prepare";
import type { StormStackCLIPresetContext } from "./types/build";
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
      ],
      [
        "@storm-stack/plugin-storage-fs",
        {
          namespace: "crash-reports",
          base: "crash-reports",
          envPath: "log"
        }
      ],
      this.#config.manageVars !== false && [
        "@storm-stack/plugin-storage-fs",
        {
          namespace: "vars",
          base:
            isSetString(this.#config.bin) ||
            (Array.isArray(this.#config.bin) && this.#config.bin.length > 0)
              ? isSetString(this.#config.bin)
                ? this.#config.bin
                : this.#config.bin[0]
              : undefined,
          envPath: "config"
        }
      ]
    ].filter(Boolean) as (string | PluginConfig)[];
  }

  public addHooks(hooks: EngineHooks<TOptions>) {
    hooks.addHooks({
      "init:context": this.initContext.bind(this),
      "init:installs": this.initInstalls.bind(this),
      "init:unimport": this.initUnimport.bind(this),
      "init:entry": this.initEntry.bind(this),
      "prepare:entry": this.prepareEntry.bind(this),
      "prepare:runtime": this.prepareRuntime.bind(this),
      "build:library": this.buildLibrary.bind(this),
      "build:application": this.buildApplication.bind(this),
      "build:complete": this.buildComplete.bind(this)
    });
  }

  protected async initContext(context: StormStackCLIPresetContext<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing CLI specific options for the Storm Stack project.`
    );

    await initContext(context, this.#config);
  }

  protected async initInstalls(context: StormStackCLIPresetContext<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Adding CLI specific dependencies to the Storm Stack project.`
    );

    await initInstalls(context, this.#config);
  }

  protected async initUnimport(context: StormStackCLIPresetContext<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing CLI specific Unimport presets for the Storm Stack project.`
    );

    await initUnimport(context, this.#config);
  }

  protected async initEntry(context: StormStackCLIPresetContext<TOptions>) {
    if (context.options.projectType === "application") {
      this.log(
        LogLevelLabel.TRACE,
        `Initializing CLI application's entry point and commands.`
      );

      await initEntry(this.log, context, this.#config);
    }
  }

  protected async prepareRuntime(
    context: StormStackCLIPresetContext<TOptions>
  ) {
    if (context.options.projectType === "application") {
      this.log(
        LogLevelLabel.TRACE,
        `Preparing the CLI application's runtime artifacts.`
      );

      await prepareRuntime(this.log, context, this.#config);
    }
  }

  protected async prepareEntry(context: StormStackCLIPresetContext<TOptions>) {
    if (context.options.projectType === "application") {
      this.log(
        LogLevelLabel.TRACE,
        `Preparing the CLI application's entry point and commands.`
      );

      await prepareEntry(this.log, context, this.#config);
    }
  }

  protected async buildLibrary(context: StormStackCLIPresetContext<TOptions>) {
    return buildLibrary(this.log, context);
  }

  protected async buildApplication(
    context: StormStackCLIPresetContext<TOptions>
  ) {
    return buildApplication(this.log, context);
  }

  protected async buildComplete(context: StormStackCLIPresetContext<TOptions>) {
    return permissionExecutable(this.log, context);
  }
}
