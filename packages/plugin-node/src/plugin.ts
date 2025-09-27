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
import { addPluginFilter } from "@storm-stack/core/lib/babel/helpers";
import type { EngineHooks } from "@storm-stack/core/types/build";
import { SourceFile } from "@storm-stack/core/types/compiler";
import { ESBuildOptions } from "@storm-stack/core/types/config";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import { IdModule } from "@storm-stack/devkit/templates/id";
import { LogModule } from "@storm-stack/devkit/templates/log";
import { StorageModule } from "@storm-stack/devkit/templates/storage";
import { readEnvTypeReflection } from "@storm-stack/plugin-env/helpers/persistence";
import { joinPaths } from "@stryke/path/join-paths";
import BabelPlugin from "./babel/plugin";
import { ContextModule } from "./templates/context";
import { EventModule } from "./templates/event";
import { MetaModule } from "./templates/meta";
import { RequestModule } from "./templates/request";
import { ResponseModule } from "./templates/response";
import { NodePluginContext, NodePluginOptions } from "./types/plugin";

/**
 * NodeJs Storm Stack plugin.
 */
export default class NodePlugin<
  TContext extends NodePluginContext = NodePluginContext,
  TOptions extends NodePluginOptions = NodePluginOptions
> extends Plugin<TContext, TOptions> {
  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TOptions>) {
    super(options);

    this.dependencies = [
      [
        "@storm-stack/plugin-env",
        { defaultConfig: "process.env", ...(this.options.env ?? {}) }
      ],
      ["@storm-stack/plugin-error", this.options.error],
      [
        "@storm-stack/plugin-log-console",
        { namespace: "console", ...this.options.console }
      ]
    ];

    this.packageDeps = {};
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
      "prepare:builtins": this.prepareBuiltins.bind(this),
      "prepare:types": this.prepareTypes.bind(this)
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
  protected initOptions(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing the NodeJs plugin options for the Storm Stack project.`
    );

    this.packageDeps["@stryke/string-format"] = { type: "dependency" };
    this.packageDeps["@types/node"] = {
      type: "devDependency",
      version: "^22.15.0"
    };

    context.options.platform = "node";
    context.options.build ??= {} as ESBuildOptions;
    context.options.override ??= {} as ESBuildOptions;

    if (
      context.options.variant === "tsup" ||
      context.options.variant === "esbuild"
    ) {
      context.options.build.target = "node22";
    }

    context.options.override ??= {};

    context.options.babel.plugins ??= [];
    context.options.babel.plugins = addPluginFilter(
      context,
      context.options.babel.plugins,
      sourceFile => !context.vfs.isMatchingBuiltinId("context", sourceFile.id),
      "error"
    );
    context.options.babel.plugins.push(BabelPlugin);
  }

  /**
   * Initializes the plugin's context with required installations.
   *
   * @param context - The context to initialize.
   */
  protected async prepareBuiltins(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the NodeJs runtime artifacts for the Storm Stack project.`
    );

    const promises = [
      context.vfs.writeBuiltinFile(
        "id",
        joinPaths(context.builtinsPath, "id.ts"),
        IdModule()
      ),
      context.vfs.writeBuiltinFile(
        "log",
        joinPaths(context.builtinsPath, "log.ts"),
        LogModule(context)
      ),
      context.vfs.writeBuiltinFile(
        "storage",
        joinPaths(context.builtinsPath, "storage.ts"),
        StorageModule(context)
      ),
      context.vfs.writeBuiltinFile(
        "context",
        joinPaths(context.builtinsPath, "context.ts"),
        ContextModule(context)
      ),
      context.vfs.writeBuiltinFile(
        "meta",
        joinPaths(context.builtinsPath, "meta.ts"),
        MetaModule(context)
      ),
      context.vfs.writeBuiltinFile(
        "event",
        joinPaths(context.builtinsPath, "event.ts"),
        EventModule(context)
      ),
      context.vfs.writeBuiltinFile(
        "request",
        joinPaths(context.builtinsPath, "request.ts"),
        RequestModule(context)
      ),
      context.vfs.writeBuiltinFile(
        "response",
        joinPaths(context.builtinsPath, "response.ts"),
        ResponseModule(context)
      )
    ];

    await Promise.all(promises);
  }

  /**
   * Returns the type definition for the plugin.
   *
   * @returns The type definition for the plugin.
   */
  protected async prepareTypes(context: TContext, sourceFile: SourceFile) {
    this.log(
      LogLevelLabel.TRACE,
      `Completing final preparations for the Storm Stack projects type definitions.`
    );

    const envReflection = await readEnvTypeReflection(context, "env");
    if (!envReflection) {
      throw new Error("Could not read environment configuration reflection.");
    }

    sourceFile.code.append(`

declare const $storm: import("storm:context").StormContext;

`);
  }
}
