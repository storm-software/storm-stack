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
import type { Context, EngineHooks, Options } from "@storm-stack/core/types";
import type { LogLevel } from "@storm-stack/types/shared/log";
import { joinPaths } from "@stryke/path/join-paths";
import { camelCase } from "@stryke/string-format/camel-case";
import type { MaybePromise } from "@stryke/types/base";
import LibraryPlugin from "./library";

export interface LogPluginConfig {
  logLevel?: LogLevel;
}

export default abstract class LogPlugin<
  TOptions extends Options = Options
> extends LibraryPlugin<TOptions> {
  /**
   * A string representing the type of plugin
   *
   * @remarks
   * This is used to determine the type of plugin during processing.
   */
  public override type: string = "log";

  public constructor(
    protected override config: LogPluginConfig,
    name: string,
    installPath?: string
  ) {
    super(config, name, installPath);

    this.config.logLevel ??= "info";
  }

  public override addHooks(hooks: EngineHooks<TOptions>) {
    super.addHooks(hooks);

    hooks.addHooks({
      "init:context": this.#initContext.bind(this),
      "prepare:runtime": this.#prepareRuntime.bind(this)
    });
  }

  /**
   * Allow derived classes to prepare the Log Sink runtime source code.
   *
   * @param context - The context to use
   */
  protected abstract writeSink(
    context: Context<TOptions>
  ): MaybePromise<string>;

  /**
   * Allow derived classes to prepare the Log Sink runtime source code.
   *
   * @param _context - The context to use
   */
  protected writeInit(_context: Context<TOptions>): MaybePromise<string> {
    // Do nothing

    return "";
  }

  async #prepareRuntime(context: Context<TOptions>) {
    this.log(LogLevelLabel.TRACE, `Prepare the Storm Stack logging project.`);

    if (context.options.projectType === "application") {
      await this.writeFile(
        joinPaths(
          context.options.projectRoot,
          context.artifactsDir,
          "runtime",
          "logs",
          `${this.name}.ts`
        ),
        await Promise.resolve(this.writeSink(context))
      );

      const initCode = await Promise.resolve(this.writeInit(context));
      if (initCode) {
        await this.writeFile(
          joinPaths(
            context.options.projectRoot,
            "runtime",
            "logs",
            `${this.name}.init.ts`
          ),
          initCode
        );
      }
    }
  }

  async #initContext(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Loading the ${this.name} plugin into the context.`
    );

    if (context.options.projectType === "application") {
      const name = `${camelCase(this.name)}Sink`;
      context.runtime.logs.push({
        name,
        logLevel: this.config.logLevel || "info",
        import: `import ${name} from "./${joinPaths("logs", this.name)}"; `
      });
    }
  }
}
