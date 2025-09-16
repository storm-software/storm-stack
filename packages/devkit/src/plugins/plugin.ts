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
import { discoverTemplates } from "@storm-stack/core/lib/context";
import { resolveEntries } from "@storm-stack/core/lib/entry";
import { tsup } from "@storm-stack/core/lib/tsup/build";
import {
  getTsconfigFilePath,
  isMatchFound
} from "@storm-stack/core/lib/typescript/tsconfig";
import { writeFile } from "@storm-stack/core/lib/utilities/write-file";
import {
  EngineHooks,
  ResolvedBabelOptions
} from "@storm-stack/core/types/build";
import { SourceFile } from "@storm-stack/core/types/compiler";
import { PluginOptions } from "@storm-stack/core/types/plugin";
import { toArray } from "@stryke/convert/to-array";
import { readJsonFile } from "@stryke/fs/json";
import { listFiles } from "@stryke/fs/list-files";
import { getUnique } from "@stryke/helpers/get-unique";
import { StormJSON } from "@stryke/json/storm-json";
import { findFileExtensionSafe } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { TypeDefinitionParameter } from "@stryke/types/configuration";
import { TsConfigJson } from "@stryke/types/tsconfig";
import { defu } from "defu";
import { existsSync } from "node:fs";
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
  public constructor(
    options: PluginOptions<TOptions> = {} as PluginOptions<TOptions>
  ) {
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
      "init:entry": this.initEntry.bind(this),
      "build:library": this.build.bind(this)
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

    context.options.entry ??= [];
    if (!Array.isArray(context.options.entry)) {
      context.options.entry = toArray(context.options.entry);
    }

    await this.checkEntryFile(
      context,
      joinPaths(context.options.sourceRoot, "index")
    );
    await this.checkEntryFile(
      context,
      joinPaths(context.options.sourceRoot, "plugin")
    );
    await this.checkEntryFile(
      context,
      joinPaths(context.options.sourceRoot, "templates", "**", "*")
    );

    context.packageDeps["@storm-stack/core"] = { type: "dependency" };
    context.options.external = ["@storm-stack/core"];

    context.options.platform = "node";
    context.options.projectType = "library";
    context.options.skipNodeModulesBundle = true;
    context.options.output.dts = false;

    context.options.variant = "tsup";

    context.options.build ??= {};
    context.options.build.target = "node22";
    context.options.build.format = ["cjs", "esm"];
    context.options.build.bundle = true;
    context.options.build.splitting = true;
    context.options.build.treeshake = true;
    context.options.build.keepNames = true;
    context.options.build.dts = true;
    context.options.build.shims = true;

    context.options.plugins.plugin ??= {};
    if (context.options.plugins.plugin.render) {
      context.options.plugins.plugin.render = defu(
        isSetObject(context.options.plugins.plugin.render)
          ? context.options.plugins.plugin.render
          : {},
        {
          templates: []
        }
      );

      context.options.plugins.plugin.render.templates = await discoverTemplates(
        context,
        toArray(
          context.options.plugins.plugin.render?.templates ||
            joinPaths(context.options.sourceRoot, "templates")
        )
      );
      context.options.entry = getUnique(
        toArray(context.options.entry ?? []).concat(
          context.options.plugins.plugin.render.templates
        )
      );

      context.packageDeps["@babel/preset-typescript"] = {
        type: "devDependency"
      };
      context.packageDeps["@alloy-js/babel-preset"] = { type: "devDependency" };

      context.packageDeps["@alloy-js/core"] = {
        type: "dependency",
        version: "^0.20.0"
      };
      context.packageDeps["@alloy-js/typescript"] = {
        type: "dependency",
        version: "^0.20.0"
      };
      context.options.external.push("@alloy-js/core", "@alloy-js/typescript");

      context.options.babel = defu(context.options.babel ?? {}, {
        inputSourceMap: true as any,
        sourceMaps: "both",
        babelHelpers: "bundled",
        extensions: [".ts", ".tsx"],
        presets: [
          [
            "@babel/preset-typescript",
            {
              filter: (sourceFile: SourceFile) =>
                context.options.plugins.plugin.render!.templates.includes(
                  sourceFile.id
                )
            }
          ],
          [
            "@alloy-js/babel-preset",
            {
              filter: (sourceFile: SourceFile) =>
                context.options.plugins.plugin.render!.templates.includes(
                  sourceFile.id
                )
            }
          ]
        ]
      }) as ResolvedBabelOptions;
    }
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

    if (context.options.plugins.plugin.render) {
      tsconfigJson.compilerOptions.jsx ??= "preserve";
      tsconfigJson.compilerOptions.jsxImportSource ??= "@alloy-js/core";

      if (
        !isMatchFound(
          "@alloy-js/core/testing/matchers",
          tsconfigJson.compilerOptions.types
        )
      ) {
        tsconfigJson.compilerOptions.types.push(
          "@alloy-js/core/testing/matchers"
        );
      }

      tsconfigJson.compilerOptions.lib ??= ["DOM", "ESNext"];
    }

    return writeFile(
      this.log,
      tsconfigFilePath,
      StormJSON.stringify(tsconfigJson)
    );
  }

  /**
   * Determine the plugin build's entry paths.
   *
   * @param context - The context of the current build.
   */
  protected async initEntry(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Initializing the plugin entry for the Storm Stack project.`
    );

    context.entry = await resolveEntries(
      context,
      toArray(context.options.entry)
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

  /**
   * Check if the entry file is valid and add it to the context.
   *
   * @param context - The build context.
   * @param entryFile - The entry file to check. This can include glob patterns.
   */
  protected async checkEntryFile(context: TContext, entryFile: string) {
    const entryFiles = [] as string[];
    if (entryFile.includes("*")) {
      entryFiles.push(...(await listFiles(entryFile)));
    } else {
      entryFiles.push(entryFile);
    }

    entryFiles.forEach(file => {
      if (!this.checkEntryFileByExtension(context, file)) {
        if (!this.checkEntryFileByExtension(context, file, "ts")) {
          this.checkEntryFileByExtension(context, file, "tsx");
        }
      }
    });
  }

  private checkEntryFileByExtension(
    context: TContext,
    entryFile: string,
    extension?: "ts" | "tsx"
  ): boolean {
    const formattedEntryFile = extension
      ? `${entryFile.replace(
          findFileExtensionSafe(entryFile) || "",
          ""
        )}.${extension}`
      : entryFile;
    if (
      existsSync(formattedEntryFile) &&
      !(context.options.entry as TypeDefinitionParameter[]).includes(
        formattedEntryFile
      )
    ) {
      (context.options.entry as TypeDefinitionParameter[]).push(
        formattedEntryFile
      );
      return true;
    }

    return false;
  }
}
