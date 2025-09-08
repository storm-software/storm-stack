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
import { tsup } from "@storm-stack/core/lib/tsup";
import {
  getTsconfigFilePath,
  isMatchFound
} from "@storm-stack/core/lib/typescript/tsconfig";
import { writeFile } from "@storm-stack/core/lib/utilities/write-file";
import { EngineHooks } from "@storm-stack/core/types/build";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import { readJsonFile } from "@stryke/fs/json";
import { StormJSON } from "@stryke/json/storm-json";
import { TsConfigJson } from "@stryke/types/tsconfig";
import { PluginPluginContext, PluginPluginOptions } from "../types/plugins";

/**
 * Plugin for building Storm Stack plugin packages.
 */
export default class PluginPlugin<
  TContext extends PluginPluginContext = PluginPluginContext,
  TOptions extends PluginPluginOptions = PluginPluginOptions
> extends Plugin<TContext, TOptions> {
  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TOptions>) {
    super(options);
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
      "build:library": this.build.bind(this),
      "build:application": this.build.bind(this)
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
      `Initializing the Config plugin options for the Storm Stack project.`
    );

    context.packageDeps["@storm-stack/core"] = { type: "dependency" };

    context.options.platform = "node";
    context.options.skipNodeModulesBundle = true;
    context.options.external = ["@storm-stack/core"];

    context.options.build ??= {};
    context.options.build.target = "node22";
    context.options.build.format = ["cjs", "esm"];
    context.options.build.bundle = true;
    context.options.build.splitting = true;
    context.options.build.treeshake = true;
    context.options.build.keepNames = true;
    context.options.build.dts = true;
    context.options.build.shims = true;
  }

  protected async initTsconfig(context: TContext) {
    const tsconfigFilePath = getTsconfigFilePath(
      context.options.projectRoot,
      context.options.tsconfig
    );

    const tsconfigJson = await readJsonFile<TsConfigJson>(tsconfigFilePath);

    tsconfigJson.compilerOptions ??= {};

    tsconfigJson.compilerOptions.module ??= "ESNext";
    tsconfigJson.compilerOptions.moduleResolution ??= "Bundler";

    tsconfigJson.compilerOptions.types ??= [];
    if (!isMatchFound("node", tsconfigJson.compilerOptions.types)) {
      tsconfigJson.compilerOptions.types.push("node");
    }

    return writeFile(
      this.log,
      tsconfigFilePath,
      StormJSON.stringify(tsconfigJson)
    );
  }

  /**
   * Builds the Storm Stack plugin package.
   *
   * @param context - The build context.
   * @returns A promise that resolves when the build is complete.
   */
  protected async build(context: TContext) {
    this.log(LogLevelLabel.TRACE, `Building the Storm Stack plugin.`);

    return tsup(context);
  }
}
