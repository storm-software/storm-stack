/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { ESBuildOptions } from "@storm-software/esbuild";
import { build as esbuild } from "@storm-software/esbuild";
import {
  getFileHeader,
  getParsedTypeScriptConfig
} from "@storm-stack/core/helpers";
import { Plugin } from "@storm-stack/core/plugin";
import type { Context, EngineHooks, Options } from "@storm-stack/core/types";
import type { SourceFile } from "@storm-stack/core/types/build";
import { readFile, readJsonFile } from "@stryke/fs/read-file";
import { StormJSON } from "@stryke/json/storm-json";
import { normalizeWindowsPath } from "@stryke/path/correct-path";
import {
  findFileExtension,
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import defu from "defu";
import { generateDeclarations, generateImports } from "./helpers/dtsgen";
import { externalPlugin } from "./helpers/external-plugin";
import { transformContext } from "./helpers/transform-context";
import { writeCreateApp } from "./runtime/app";
import { writeContext } from "./runtime/context";
import { writeEvent } from "./runtime/event";
import { writeInit } from "./runtime/init";
import type { StormStackNodePluginConfig } from "./types/config";
import { StormStackNodeFeatures } from "./types/config";

export default class StormStackNodePlugin<
  TOptions extends Options = Options
> extends Plugin<TOptions> {
  /**
   * The configuration for the Node.js plugin
   */
  protected config: StormStackNodePluginConfig;

  public constructor(config: Partial<StormStackNodePluginConfig> = {}) {
    super("node", "@storm-stack/plugin-node");

    this.config = config as StormStackNodePluginConfig;
    this.config.features ??= [];
    this.config.skipBuild ??= false;
  }

  public addHooks(hooks: EngineHooks<TOptions>) {
    hooks.addHooks({
      "init:context": this.initOptions.bind(this),
      "init:installs": this.initInstalls.bind(this),
      "init:tsconfig": this.initTsconfig.bind(this),
      "prepare:types": this.prepareTypes.bind(this),
      "prepare:runtime": this.prepareRuntime.bind(this),
      "prepare:entry": this.prepareEntry.bind(this),
      "build:transform": this.transform.bind(this)
    });

    if (!this.config.skipBuild) {
      hooks.addHooks({
        "build:execute": this.build.bind(this)
      });
    }
  }

  protected override async buildApp(context: Context<TOptions>) {
    this.log(LogLevelLabel.TRACE, `Building the project`);

    return this.esbuild(context);
  }

  protected async initOptions(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Resolving Storm Stack context for the project.`
    );

    context.platform ??= "node";
    context.override.format = "esm";
    context.override.target = "node22";

    context.unimportPresets.push({
      imports: ["builder"],
      from: "storm:app"
    });
    context.unimportPresets.push({
      imports: ["useStorm"],
      from: "storm:context"
    });
    context.unimportPresets.push({
      imports: ["StormEvent"],
      from: "storm:event"
    });
  }

  protected async initInstalls(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Running required installations for the project.`
    );

    await Promise.all(
      [
        this.install(context, "@types/node", true),
        context.projectType === "application" &&
          this.install(context, "@stryke/json"),
        context.projectType === "application" &&
          this.install(context, "@stryke/type-checks"),
        context.projectType === "application" &&
          this.install(context, "@stryke/env"),
        context.projectType === "application" &&
          this.install(context, "@storm-stack/log-console"),
        context.projectType === "application" &&
          this.config.features.includes(StormStackNodeFeatures.SENTRY) &&
          this.install(context, "@storm-stack/log-sentry")
      ].filter(Boolean)
    );
  }

  protected async initTsconfig(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Resolving TypeScript configuration in "${context.tsconfig!}"`
    );

    const tsconfig = await getParsedTypeScriptConfig(context);
    const tsconfigJson = await readJsonFile<TsConfigJson>(context.tsconfig!);

    tsconfigJson.compilerOptions ??= {};
    if (
      !tsconfig.options.types?.some(
        type =>
          type.toLowerCase() === "node" || type.toLowerCase() === "@types/node"
      )
    ) {
      tsconfigJson.compilerOptions.types ??= [];
      tsconfigJson.compilerOptions.types.push("node");
    }

    return this.writeFile(context.tsconfig!, StormJSON.stringify(tsconfigJson));
  }

  protected async prepareTypes(context: Context<TOptions>) {
    if (!context.dts || !context.resolvedDotenv.types?.variables?.properties) {
      return;
    }

    const typesDir = joinPaths(context.projectRoot, context.typesDir);

    this.log(
      LogLevelLabel.TRACE,
      `Preparing the type declaration (d.ts) files in "${typesDir}"`
    );

    const runtimePath = relativePath(
      joinPaths(context.projectRoot, context.typesDir),
      joinPaths(context.projectRoot, context.runtimeDir)
    );

    await Promise.all(
      [
        this.writeFile(
          joinPaths(typesDir, "node.d.ts"),
          generateImports(runtimePath)
        ),
        this.writeFile(
          joinPaths(
            context.projectRoot,
            context.dts.replace(context.projectRoot, "").trim()
          ),
          generateDeclarations(
            context.resolvedDotenv.types.variables.properties,
            this.config.features
          )
        )
      ].filter(Boolean)
    );
  }

  protected async prepareRuntime(context: Context<TOptions>) {
    const runtimeDir = joinPaths(context.projectRoot, context.runtimeDir);

    this.log(
      LogLevelLabel.TRACE,
      `Preparing the runtime files in "${runtimeDir}"`
    );

    await Promise.all([
      this.writeFile(joinPaths(runtimeDir, "app.ts"), writeCreateApp()),
      this.writeFile(joinPaths(runtimeDir, "context.ts"), writeContext()),
      this.writeFile(joinPaths(runtimeDir, "event.ts"), writeEvent()),
      this.writeFile(joinPaths(runtimeDir, "init.ts"), writeInit())
    ]);
  }

  protected async prepareEntry(context: Context<TOptions>) {
    await Promise.all(
      context.resolvedEntry.map(async entry => {
        this.log(
          LogLevelLabel.TRACE,
          `Preparing the entry artifact ${entry.file} (${entry?.name ? `export: "${entry.name}"` : "default"})" from input "${entry.input.file} (${entry.input.name ? `export: "${entry.input.name}"` : "default"})"`
        );

        return this.writeFile(
          entry.file,
          `${getFileHeader()}

import ".${joinPaths(context.runtimeDir.replace(context.artifactsDir, ""), "init")}";

import ${entry.input.name ? `{ ${entry.input.name} as handle }` : "handle"} from "${joinPaths(
            relativePath(
              joinPaths(context.projectRoot, findFilePath(entry.file)),
              joinPaths(context.projectRoot, findFilePath(entry.input.file))
            ),
            findFileName(entry.input.file).replace(
              findFileExtension(entry.input.file),
              ""
            )
          )}";
import { builder } from ".${joinPaths(context.runtimeDir.replace(context.artifactsDir, ""), "app")}";
import { getSink } from "@storm-stack/log-console";

export default builder({
  name: ${context.name ? `"${context.name}"` : "undefined"},
  log: { handle: getSink(), logLevel: "debug" },
})
  .handler(handle)
  .build();

`
        );
      })
    );
  }

  protected async transform(
    context: Context<TOptions>,
    sourceFile: SourceFile
  ) {
    transformContext(sourceFile);
  }

  /**
   * Run the esbuild process
   *
   * @param context - The build context
   * @param override - Top priority build options override
   */
  private async esbuild(
    context: Context<TOptions>,
    override: Partial<ESBuildOptions> = {}
  ) {
    const runtimeDir = joinPaths(context.projectRoot, context.runtimeDir);

    return esbuild(
      defu(override ?? {}, context.override, {
        entry: context.resolvedEntry.map(entry => entry.file),
        projectRoot: context.projectRoot,
        outputPath: context.outputPath,
        platform: context.platform,
        generatePackageJson: true,
        minify: Boolean(context.minify),
        sourcemap: context.mode !== "production",
        bundle: true,
        env: context.resolvedDotenv.values as {
          [key: string]: string;
        },
        alias: {
          "storm:app": joinPaths(runtimeDir, "app"),
          "storm:context": joinPaths(runtimeDir, "context"),
          "storm:error": joinPaths(runtimeDir, "error"),
          "storm:event": joinPaths(runtimeDir, "event"),
          "storm:id": joinPaths(runtimeDir, "id"),
          "storm:log": joinPaths(runtimeDir, "log"),
          "storm:request": joinPaths(runtimeDir, "request"),
          "storm:response": joinPaths(runtimeDir, "response")
        },
        plugins: [
          externalPlugin(
            context,
            context.resolvedTsconfig.tsconfigJson.compilerOptions?.paths
          ),
          {
            name: "storm-stack:compiler",
            setup: build => {
              build.onLoad({ filter: /\.ts$/ }, async args => {
                this.log(
                  LogLevelLabel.TRACE,
                  `Transforming ${args.path} with Storm Stack compiler`
                );

                return {
                  contents: await context.compiler.compile(
                    context,
                    normalizeWindowsPath(args.path),
                    await readFile(args.path)
                  )
                };
              });
            }
          }
        ]
      }) as ESBuildOptions
    );
  }
}
