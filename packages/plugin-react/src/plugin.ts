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
import { resolveBabelOptions } from "@storm-stack/core/lib/babel/options";
import { writeFile } from "@storm-stack/core/lib/utilities/write-file";
import { vite } from "@storm-stack/core/lib/vite/build";
import type {
  EngineHooks,
  ViteConfigHookParams
} from "@storm-stack/core/types/build";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import { IdModule } from "@storm-stack/devkit/templates/id";
import { LogModule } from "@storm-stack/devkit/templates/log";
import { StorageModule } from "@storm-stack/devkit/templates/storage";
import { ConfigModule } from "@storm-stack/plugin-config/templates/config";
import { readJsonFile } from "@stryke/fs/json";
import { StormJSON } from "@stryke/json";
import { joinPaths } from "@stryke/path/join-paths";
import { TsConfigJson } from "@stryke/types/tsconfig";
import viteReactPlugin, { BabelOptions } from "@vitejs/plugin-react";
import defu from "defu";
import BabelPlugin from "./babel/plugin";
import { ContextModule } from "./templates/context";
import { EnvModule } from "./templates/env";
import { RequestModule } from "./templates/request";
import { ResponseModule } from "./templates/response";
import { ReactPluginContext, ReactPluginOptions } from "./types/plugin";

/**
 * The React Storm Stack plugin.
 */
export default class ReactPlugin<
  TContext extends ReactPluginContext = ReactPluginContext,
  TOptions extends ReactPluginOptions = ReactPluginOptions
> extends Plugin<TContext, TOptions> {
  /**
   * The constructor for the plugin
   *
   * @param options - The configuration options for the plugin
   */
  public constructor(options: PluginOptions<TOptions>) {
    super(options);

    this.dependencies = [
      ["@storm-stack/plugin-config", this.options.config],
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
      "prepare:runtime": this.prepareRuntime.bind(this),
      "build:application": this.buildApplication.bind(this),
      "vite:config": this.viteConfig.bind(this)
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
      `Initializing the React plugin options for the Storm Stack project.`
    );

    this.packageDeps.react = { type: "dependency", version: "^19.1.1" };
    this.packageDeps["react-dom"] = { type: "dependency", version: "^19.1.1" };
    this.packageDeps["@types/react"] = {
      type: "devDependency",
      version: "^19.1.9"
    };
    this.packageDeps["@types/react-dom"] = {
      type: "devDependency",
      version: "^19.1.7"
    };

    context.options.variant ??= "vite";
    context.options.platform = "browser";

    context.options.babel.plugins ??= [];
    context.options.babel.plugins = addPluginFilter(
      context,
      context.options.babel.plugins,
      sourceFile => !context.vfs.isMatchingRuntimeId("context", sourceFile.id),
      "error"
    );
    context.options.babel.plugins.push(BabelPlugin);
    context.options.babel.plugins.unshift([
      "@babel/plugin-syntax-jsx",
      {
        runtime: this.options.jsxRuntime ?? "automatic",
        importSource: this.options.jsxImportSource ?? "react"
      }
    ]);

    if (context.options.variant === "vite") {
      context.options.build.build ??= {};
      context.options.build.build.target = "chrome95";
    }
  }

  /**
   * Initializes the TypeScript configuration for the Storm Stack project.
   *
   * @param context - The context to initialize the TypeScript configuration with.
   */
  protected async initTsconfig(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing TypeScript configuration for the Storm Stack project.`
    );

    const tsconfigJson = await readJsonFile<TsConfigJson>(
      context.tsconfig.tsconfigFilePath
    );

    tsconfigJson.compilerOptions ??= {};
    tsconfigJson.compilerOptions.jsx ??= "react-jsx";

    if (context.tsconfig.options.resolveJsonModule !== true) {
      tsconfigJson.compilerOptions.resolveJsonModule = true;
    }

    return writeFile(
      context.log,
      context.tsconfig.tsconfigFilePath,
      StormJSON.stringify(tsconfigJson)
    );
  }

  /**
   * Initializes the plugin's context with required installations.
   *
   * @param context - The context to initialize.
   */
  protected async prepareRuntime(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the React runtime artifacts for the Storm Stack project.`
    );

    const promises = [
      context.vfs.writeRuntimeFile(
        "id",
        joinPaths(context.runtimePath, "id.ts"),
        IdModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "config",
        joinPaths(context.runtimePath, "config.ts"),
        await ConfigModule(context, "import.meta.env")
      ),
      context.vfs.writeRuntimeFile(
        "log",
        joinPaths(context.runtimePath, "log.ts"),
        LogModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "storage",
        joinPaths(context.runtimePath, "storage.ts"),
        StorageModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "env",
        joinPaths(context.runtimePath, "env.ts"),
        EnvModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "context",
        joinPaths(context.runtimePath, "context.tsx"),
        ContextModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "request",
        joinPaths(context.runtimePath, "request.ts"),
        RequestModule(context)
      ),
      context.vfs.writeRuntimeFile(
        "response",
        joinPaths(context.runtimePath, "response.ts"),
        ResponseModule(context)
      )
    ];

    await Promise.all(promises);
  }

  protected async buildApplication(context: TContext) {
    if (context.options.variant === "vite") {
      this.log(
        LogLevelLabel.TRACE,
        `Building the React application for the Storm Stack project.`
      );

      const babel = resolveBabelOptions(context, this.log) as BabelOptions;
      if (this.getOptions(context).compiler !== false) {
        context.options.babel.plugins.push([
          "babel-plugin-react-compiler",
          defu(this.getOptions(context).compiler ?? {}, {
            target: "19"
          })
        ]);
      }

      context.options.build.plugins ??= [];
      context.options.build.plugins.unshift(
        viteReactPlugin({
          babel,
          jsxImportSource: this.getOptions(context).jsxImportSource,
          jsxRuntime: this.getOptions(context).jsxRuntime
        })
      );

      await vite(context);
    }
  }

  /**
   * Configures Vite to use the React plugin.
   *
   * @param context - The current build context.
   * @param params - The Vite config hook parameters.
   */
  protected async viteConfig(context: TContext, params: ViteConfigHookParams) {
    params.config.plugins ??= [];

    const babel = resolveBabelOptions(context, this.log) as BabelOptions;
    if (this.getOptions(context).compiler !== false) {
      babel.plugins ??= [];
      babel.plugins.push([
        "babel-plugin-react-compiler",
        defu(this.getOptions(context).compiler ?? {}, {
          target: "19"
        })
      ]);
    }

    params.config.plugins.unshift(
      viteReactPlugin({
        babel,
        jsxImportSource: this.getOptions(context).jsxImportSource,
        jsxRuntime: this.getOptions(context).jsxRuntime
      })
    );
  }
}
