/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { Context, EngineHooks, LogFn } from "@storm-stack/core/types";
import type { LogLevel } from "@storm-stack/types/shared/log";
import { joinPaths } from "@stryke/path/join-paths";
import { camelCase } from "@stryke/string-format/camel-case";
import type { MaybePromise } from "@stryke/types/base";
import LibraryPlugin from "./library";

export interface LogPluginConfig {
  logLevel?: LogLevel;
  namespace?: string;
}

/**
 * Base class for Log plugins in Storm Stack.
 *
 * @remarks
 * This class provides the foundation for creating logging plugins in Storm Stack. It handles the initialization of the plugin's context and prepares the runtime for logging sinks. Derived classes must implement the `writeSink` method to define how the logging sink should be.
 */
export default abstract class LogPlugin extends LibraryPlugin {
  public constructor(
    log: LogFn,
    protected override config: LogPluginConfig,
    name: string,
    installPath?: string
  ) {
    super(log, config, name, installPath);

    this.config.logLevel ??= "info";
  }

  /**
   * Adds the plugin's hooks to the engine.
   *
   * @param hooks - The engine hooks to add the plugin's hooks to.
   */
  public override innerAddHooks(hooks: EngineHooks) {
    super.innerAddHooks(hooks);

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
  protected abstract writeSink(context: Context): MaybePromise<string>;

  async #prepareRuntime(context: Context) {
    this.log(LogLevelLabel.TRACE, `Prepare the Storm Stack logging project.`);

    if (context.options.projectType === "application") {
      await this.writeFile(
        joinPaths(
          context.runtimePath,
          "logs",
          `${this.name.replace(/^log-/, "")}${
            this.config.namespace
              ? `-${this.config.namespace
                  .replaceAll(".", "-")
                  .replaceAll(":", "-")
                  .replaceAll(" ", "-")}`
              : ""
          }-${this.config.logLevel}.ts`
        ),
        await Promise.resolve(this.writeSink(context))
      );
    }
  }

  async #initContext(context: Context) {
    this.log(
      LogLevelLabel.TRACE,
      `Loading the ${this.name} plugin into the context.`
    );

    if (context.options.projectType === "application") {
      const name = `${camelCase(
        `${this.name.replace(/^log-/, "")}${
          this.config.namespace
            ? `-${this.config.namespace
                .replaceAll(".", "-")
                .replaceAll(":", "-")
                .replaceAll(" ", "-")}`
            : ""
        }-${this.config.logLevel}`
      )}Sink`;
      if (!context.runtime.logs.some(log => log.name === name)) {
        context.runtime.logs.push({
          name,
          logLevel: this.config.logLevel || "info",
          import: `import ${name} from "./${joinPaths(
            "logs",
            `${this.name.replace(/^log-/, "")}${
              this.config.namespace
                ? `-${this.config.namespace
                    .replaceAll(".", "-")
                    .replaceAll(":", "-")
                    .replaceAll(" ", "-")}`
                : ""
            }-${this.config.logLevel}`
          )}"; `
        });
      }
    }
  }
}
