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
import type { EngineHooks } from "@storm-stack/core/types";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import { joinPaths } from "@stryke/path/join-paths";
import { camelCase } from "@stryke/string-format/camel-case";
import { kebabCase } from "@stryke/string-format/kebab-case";
import type { MaybePromise } from "@stryke/types/base";
import { LogPluginContext, LogPluginOptions } from "../types/plugins";

/**
 * Base class for Log plugins in Storm Stack.
 *
 * @remarks
 * This class provides the foundation for creating logging plugins in Storm Stack. It handles the initialization of the plugin's context and prepares the runtime for logging adapters. Derived classes must implement the `writeAdapter` method to define how the logging adapter should be.
 */
abstract class LogPlugin<
  TContext extends LogPluginContext = LogPluginContext,
  TOptions extends LogPluginOptions = LogPluginOptions
> extends Plugin<TContext, TOptions> {
  /**
   * A list of primary keys for the plugin's options.
   *
   * @remarks
   * This is used to identify when two instances of the plugin are the same and can be de-duplicated.
   */
  protected override get primaryKeyFields(): string[] {
    return ["namespace", "logLevel"];
  }

  /**
   * A property to override the plugin's {@link name} field.
   *
   * @remarks
   * This is useful for plugins that need to have a different name than the default one derived from the class name.
   */
  protected override get overrideName(): string {
    return this.constructor.name.replace(/^Log/, "").replace(/Plugin$/, "");
  }

  /**
   * Creates an instance of the log plugin.
   *
   * @param options - The options for the log plugin.
   */
  public constructor(options: PluginOptions<TOptions>) {
    super(options);

    this.options.logLevel ??= "info";
    this.options.namespace ??= this.name;
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
      "prepare:builtins": this.#prepareBuiltins.bind(this)
    });
  }

  /**
   * Allow derived classes to prepare the Log Adapter runtime source code.
   *
   * @param context - The context to use
   */
  protected abstract writeAdapter(context: TContext): MaybePromise<string>;

  async #prepareBuiltins(context: TContext) {
    this.log(LogLevelLabel.TRACE, `Prepare the Storm Stack logging project.`);

    if (context.options.projectType === "application") {
      if (!this.options.logLevel) {
        throw new Error(
          `The namespace for the ${this.identifier} plugin is not defined. Please set the namespace option in the plugin configuration.`
        );
      }

      await context.vfs.writeBuiltinFile(
        `log/${kebabCase(this.identifier)}`,
        joinPaths(
          context.builtinsPath,
          "log",
          `${kebabCase(this.identifier)}.ts`
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
      const name = `${camelCase(this.identifier)}Storage`;
      if (!context.runtime.logs.some(log => log.name === name)) {
        context.runtime.logs.push({
          name,
          namespace: this.getOptions(context).namespace!,
          logLevel: this.options.logLevel ?? "info",
          fileName: joinPaths("log", kebabCase(this.identifier))
        });
      }
    }
  }
}

export default LogPlugin;
