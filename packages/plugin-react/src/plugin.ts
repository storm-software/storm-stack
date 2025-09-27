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

import babelJSXSyntaxPlugin from "@babel/plugin-syntax-jsx";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { Plugin } from "@storm-stack/core/base/plugin";
import { addPluginFilter } from "@storm-stack/core/lib/babel/helpers";
import { resolveBabelOptions } from "@storm-stack/core/lib/babel/options";
import { isMatchFound } from "@storm-stack/core/lib/typescript/tsconfig";
import { writeFile } from "@storm-stack/core/lib/utilities/write-file";
import { vite } from "@storm-stack/core/lib/vite/build";
import type {
  EngineHooks,
  ViteConfigHookParams
} from "@storm-stack/core/types/build";
import { SourceFile } from "@storm-stack/core/types/compiler";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import { IdModule } from "@storm-stack/devkit/templates/id";
import { LogModule } from "@storm-stack/devkit/templates/log";
import { StorageModule } from "@storm-stack/devkit/templates/storage";
import { readJsonFile } from "@stryke/fs/json";
import { StormJSON } from "@stryke/json";
import { findFileExtensionSafe } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { TsConfigJson } from "@stryke/types/tsconfig";
import viteReactPlugin, { BabelOptions } from "@vitejs/plugin-react";
import {
  LoggerEvent,
  PluginOptions as ReactCompilerOptions
} from "babel-plugin-react-compiler";
import defu from "defu";
import babelPlugin from "./babel/plugin";
import { ContextModule } from "./templates/context";
import { MetaModule } from "./templates/meta";
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
      [
        "@storm-stack/plugin-env",
        { defaultConfig: "import.meta.env", ...(this.options.env ?? {}) }
      ],
      ["@storm-stack/plugin-error", this.options.error ?? {}],
      [
        "@storm-stack/plugin-log-console",
        { namespace: "console", ...(this.options.console ?? {}) }
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
  protected async initOptions(context: TContext) {
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

    const tsconfigJson = await readJsonFile<TsConfigJson>(
      context.options.tsconfig
    );

    context.options.plugins.react.jsxRuntime ??= "automatic";
    context.options.plugins.react.jsxImportSource ??=
      tsconfigJson.compilerOptions?.jsxImportSource || "react";

    if (context.options.plugins.react.compiler !== false) {
      context.options.plugins.react.compiler = defu(
        context.options.plugins.react.compiler ?? {},
        {
          target: "19",
          compilationMode: "infer",
          gating: {
            source: "storm:meta",
            importSpecifierName: "shouldUseOptimizedReact"
          },
          enableReanimatedCheck: true,
          logger: {
            logEvent: (filename: string | null, event: LoggerEvent) => {
              this.log(
                event.kind === "CompileSuccess"
                  ? LogLevelLabel.SUCCESS
                  : event.kind === "AutoDepsEligible" ||
                      event.kind === "AutoDepsDecorations"
                    ? LogLevelLabel.INFO
                    : event.kind === "CompileSkip" ||
                        event.kind === "CompileDiagnostic"
                      ? LogLevelLabel.DEBUG
                      : event.kind === "Timing"
                        ? LogLevelLabel.TRACE
                        : LogLevelLabel.ERROR,
                `(${filename}) ${
                  event.kind === "CompileSuccess"
                    ? `React Compiler Success`
                    : event.kind === "AutoDepsEligible"
                      ? `React AutoDeps Eligible - ${
                          event.depArrayLoc.identifierName || "No identifier"
                        }`
                      : event.kind === "AutoDepsDecorations"
                        ? `React AutoDeps Decorations - ${event.decorations
                            .filter(dec => dec.identifierName)
                            .map(dec => dec.identifierName)
                            .join(", ")}`
                        : event.kind === "CompileSkip"
                          ? `React Compile Skip - ${event.reason}`
                          : event.kind === "CompileDiagnostic"
                            ? `React Compile Diagnostic - (Category: ${
                                event.detail.category
                              }) ${event.detail.reason}${
                                event.detail.description
                                  ? `\n${event.detail.description}`
                                  : ""
                              }`
                            : event.kind === "Timing"
                              ? `React Timing - ${event.measurement}`
                              : `React Compiler Error - ${event.fnLoc?.identifierName || "unknown location"}`
                }`
              );
            }
          }
        }
      ) as ReactCompilerOptions;
    }

    context.options.babel.plugins ??= [];

    context.options.babel.plugins = addPluginFilter(
      context,
      context.options.babel.plugins,
      sourceFile => !context.vfs.isMatchingBuiltinId("context", sourceFile.id),
      "error"
    );

    context.options.babel.plugins.push(babelPlugin);
    context.options.babel.plugins.unshift([
      babelJSXSyntaxPlugin,
      {
        runtime: context.options.plugins.react.jsxRuntime ?? "automatic",
        importSource: context.options.plugins.react.jsxImportSource ?? "react"
      },
      {
        filter: (sourceFile: SourceFile) =>
          findFileExtensionSafe(sourceFile.id) === "tsx"
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
    tsconfigJson.compilerOptions.module ??= "esnext";

    tsconfigJson.compilerOptions.jsxImportSource =
      this.getOptions(context).jsxImportSource;
    if (tsconfigJson.compilerOptions.jsxImportSource === "react") {
      tsconfigJson.compilerOptions.jsx ??= "react-jsx";
    } else {
      tsconfigJson.compilerOptions.jsx ??= "preserve";
    }

    tsconfigJson.compilerOptions.lib = [];
    if (!isMatchFound("dom", tsconfigJson.compilerOptions.lib)) {
      tsconfigJson.compilerOptions.lib.push("DOM");
    }
    if (!isMatchFound("dom.iterable", tsconfigJson.compilerOptions.lib)) {
      tsconfigJson.compilerOptions.lib.push("DOM.Iterable");
    }
    if (!isMatchFound("esnext", tsconfigJson.compilerOptions.lib)) {
      tsconfigJson.compilerOptions.lib.push("ESNext");
    }

    if (context.tsconfig.options.resolveJsonModule !== true) {
      tsconfigJson.compilerOptions.resolveJsonModule = true;
    }

    if (context.options.variant === "vite") {
      tsconfigJson.compilerOptions.types ??= [];

      if (!isMatchFound("vite/client", tsconfigJson.compilerOptions.types)) {
        tsconfigJson.compilerOptions.types.push("vite/client");
      }
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
  protected async prepareBuiltins(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the React runtime artifacts for the Storm Stack project.`
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
        "meta",
        joinPaths(context.builtinsPath, "meta.ts"),
        MetaModule(context)
      ),
      context.vfs.writeBuiltinFile(
        "context",
        joinPaths(context.builtinsPath, "context.tsx"),
        ContextModule(context)
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

  protected async buildApplication(context: TContext) {
    if (context.options.variant === "vite") {
      this.log(
        LogLevelLabel.TRACE,
        `Building the React application for the Storm Stack project.`
      );

      const babel = resolveBabelOptions(this.log, context) as BabelOptions;
      if (this.getOptions(context).compiler !== false) {
        context.options.babel.plugins.push([
          "babel-plugin-react-compiler",
          this.getOptions(context).compiler
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

    const babel = resolveBabelOptions(this.log, context) as BabelOptions;
    if (this.getOptions(context).compiler !== false) {
      babel.plugins ??= [];
      babel.plugins.push([
        "babel-plugin-react-compiler",
        this.getOptions(context).compiler
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
