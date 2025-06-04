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
  namespace?: string;
}

export default abstract class LogPlugin<
  TOptions extends Options = Options
> extends LibraryPlugin<TOptions> {
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

  async #prepareRuntime(context: Context<TOptions>) {
    this.log(LogLevelLabel.TRACE, `Prepare the Storm Stack logging project.`);

    if (context.options.projectType === "application") {
      await this.writeFile(
        joinPaths(
          context.runtimePath,
          "logs",
          `${this.name}${this.config.namespace ? `-${this.config.namespace.replaceAll(".", "-").replaceAll(":", "-").replaceAll(" ", "-")}` : ""}-${this.config.logLevel}.ts`
        ),
        await Promise.resolve(this.writeSink(context))
      );
    }
  }

  async #initContext(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Loading the ${this.name} plugin into the context.`
    );

    if (context.options.projectType === "application") {
      const name = `${camelCase(`${this.name}${this.config.namespace ? `-${this.config.namespace.replaceAll(".", "-").replaceAll(":", "-").replaceAll(" ", "-")}` : ""}-${this.config.logLevel}`)}Sink`;
      context.runtime.logs.push({
        name,
        logLevel: this.config.logLevel || "info",
        import: `import ${name} from "./${joinPaths("logs", `${this.name}${this.config.namespace ? `-${this.config.namespace.replaceAll(".", "-").replaceAll(":", "-").replaceAll(" ", "-")}` : ""}-${this.config.logLevel}`)}"; `
      });
    }
  }
}
