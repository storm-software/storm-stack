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
import type { EngineHooks } from "@storm-stack/core/types/build";
import { Template } from "@storm-stack/core/types/config";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import { joinPaths } from "@stryke/path/join-paths";
import { DateFnsModule } from "./templates/date-fns";
import { DayjsModule } from "./templates/dayjs";
import { LuxonModule } from "./templates/luxon";
import { MomentModule } from "./templates/moment";
import {
  DatePluginContext,
  DatePluginOptions,
  ResolvedDatePluginOptions
} from "./types";

/**
 * Storm Stack - Date plugin.
 */
export default class DatePlugin<
  TContext extends DatePluginContext = DatePluginContext,
  TOptions extends DatePluginOptions = DatePluginOptions
> extends Plugin<TContext, TOptions> {
  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TOptions>) {
    super(options);

    this.packageDeps = {};
    this.dependencies = [["@storm-stack/plugin-config", options.config]];
  }

  /**
   * Adds hooks to the engine's hook system.
   *
   * @param hooks - The hooks to add to the engine.
   */
  public override addHooks(hooks: EngineHooks<TContext>) {
    super.addHooks(hooks);

    hooks.addHooks({
      "init:options": this.initOptions.bind(this),
      "prepare:runtime": this.prepareRuntime.bind(this)
    });
  }

  /**
   * Initializes the plugin's options.
   *
   * @remarks
   * This method is called during the initialization phase of the plugin. It can be used to set default options or modify existing ones.
   *
   * @param context - The context of the current build.
   */
  protected async initOptions(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing the Date plugin options for the Storm Stack project.`
    );

    context.options.plugins.date ??= {
      type: "date-fns"
    } as ResolvedDatePluginOptions;

    if (
      !context.options.plugins.date.type ||
      !["date-fns", "dayjs", "luxon", "moment"].includes(
        context.options.plugins.date.type
      )
    ) {
      if (context.options.plugins.date.type) {
        this.log(
          LogLevelLabel.WARN,
          `Invalid date library type "${context.options.plugins.date.type}" specified. Defaulting to "date-fns".`
        );
      }

      context.options.plugins.date.type = "date-fns";
    }

    this.log(
      LogLevelLabel.DEBUG,
      `Using date library: ${context.options.plugins.date.type}`
    );

    this.packageDeps[context.options.plugins.date.type] = "dependency";
  }

  /**
   * Initializes the plugin's context with required installations.
   *
   * @param context - The context to initialize.
   */
  protected async prepareRuntime(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the date runtime artifacts for the Storm Stack project.`
    );

    let dateTemplate!: Template;
    switch (context.options.plugins.date.type) {
      case "dayjs":
        dateTemplate = DayjsModule;
        break;
      case "luxon":
        dateTemplate = LuxonModule;
        break;
      case "moment":
        dateTemplate = MomentModule;
        break;
      case "date-fns":
      default:
        // Default to date-fns if no type is specified or if the type is not recognized
        dateTemplate = DateFnsModule;
        break;
    }

    await context.vfs.writeRuntimeFile(
      "date",
      joinPaths(context.runtimePath, "date.ts"),
      await Promise.resolve(dateTemplate(context))
    );
  }
}
