/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { Plugin } from "@storm-stack/core/base/plugin";
import { PrimaryKey } from "@storm-stack/core/deepkit";
import type { Context, EngineHooks } from "@storm-stack/core/types";
import {
  PluginBaseOptions,
  PluginOptions
} from "@storm-stack/core/types/plugin";
import type { LogLevel } from "@storm-stack/types/shared/log";
import { joinPaths } from "@stryke/path/join-paths";
import { camelCase } from "@stryke/string-format/camel-case";
import { kebabCase } from "@stryke/string-format/kebab-case";
import type { MaybePromise } from "@stryke/types/base";

export interface LogPluginOptions extends PluginBaseOptions {
  logLevel?: LogLevel & PrimaryKey;
  namespace?: string & PrimaryKey;
}

/**
 * Base class for Log plugins in Storm Stack.
 *
 * @remarks
 * This class provides the foundation for creating logging plugins in Storm Stack. It handles the initialization of the plugin's context and prepares the runtime for logging adapters. Derived classes must implement the `writeAdapter` method to define how the logging adapter should be.
 */
export default abstract class LogPlugin<
  TOptions extends LogPluginOptions = LogPluginOptions,
  TContext extends Context = Context
> extends Plugin<TOptions, TContext> {
  /**
   * A list of primary keys for the plugin's options.
   *
   * @remarks
   * This is used to identify when two instances of the plugin are the same and can be de-duplicated.
   */
  protected override get primaryKeyFields(): string[] {
    return ["namespace", "logLevel"];
  }

  public constructor(options: PluginOptions<TOptions>) {
    super(options);
    this.options.logLevel ??= "info";
  }

  /**
   * Adds the plugin's hooks to the engine.
   *
   * @param hooks - The engine hooks to add the plugin's hooks to.
   */
  public override addHooks(hooks: EngineHooks<TContext>) {
    super.addHooks(hooks);

    hooks.addHooks({
      "init:complete": this.#initComplete.bind(this),
      "prepare:runtime": this.#prepareRuntime.bind(this)
    });
  }

  /**
   * Allow derived classes to prepare the Log Adapter runtime source code.
   *
   * @param context - The context to use
   */
  protected abstract writeAdapter(context: TContext): MaybePromise<string>;

  async #prepareRuntime(context: TContext) {
    this.log(LogLevelLabel.TRACE, `Prepare the Storm Stack logging project.`);

    if (context.options.projectType === "application") {
      if (!this.options.logLevel) {
        throw new Error(
          `The namespace for the ${this.identifier} plugin is not defined. Please set the namespace option in the plugin configuration.`
        );
      }

      await context.vfs.writeRuntimeFile(
        `log/${kebabCase(this.identifier).replace(/^log-/g, "")}`,
        joinPaths(
          context.runtimePath,
          "log",
          `${kebabCase(this.identifier).replace(/^log-/g, "")}.ts`
        ),
        await Promise.resolve(this.writeAdapter(context))
      );
    }
  }

  async #initComplete(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Loading the ${this.identifier} plugin into the context.`
    );

    if (context.options.projectType === "application") {
      const name = camelCase(this.identifier);
      if (!context.runtime.logs.some(log => log.name === name)) {
        context.runtime.logs.push({
          name,
          logLevel: this.options.logLevel ?? "info",
          fileName: joinPaths(
            "log",
            kebabCase(this.identifier).replace(/^log-/g, "")
          )
        });
      }
    }
  }
}
