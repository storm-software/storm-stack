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
import {
  joinPaths,
  normalizeWindowsPath
} from "@storm-software/config-tools/utilities/correct-paths";
import type { ESBuildOptions } from "@storm-software/esbuild";
import { build as esbuild } from "@storm-software/esbuild";
import { readFile, readJsonFile } from "@stryke/fs/files/read-file";
import { StormJSON } from "@stryke/json/storm-json";
import {
  findFileExtension,
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/utilities/file-path-fns";
import type { TsConfigJson } from "@stryke/types/utility-types/tsconfig";
import defu from "defu";
import { getFileHeader, getParsedTypeScriptConfig } from "storm-stack/helpers";
import { Plugin } from "storm-stack/plugin";
import type {
  EngineHooks,
  InferResolvedOptions,
  Options
} from "storm-stack/types";
import {
  generateDeclarations,
  generateHttpImports,
  generateImports
} from "./helpers/dtsgen";
import { externalPlugin } from "./helpers/external-plugin";
import { writeCreateApp } from "./runtime/app";
import { writeContext } from "./runtime/context";
import { writeEvent } from "./runtime/event";
import type { StormStackNodePluginConfig } from "./types/config";
import { StormStackNodeAppStyle, StormStackNodeFeatures } from "./types/config";

export default class NodePlugin<
  TOptions extends Options = Options,
  TResolvedOptions extends
    InferResolvedOptions<TOptions> = InferResolvedOptions<TOptions>
> extends Plugin<TOptions, TResolvedOptions> {
  /**
   * The configuration for the Node.js plugin
   */
  protected config: StormStackNodePluginConfig;

  public constructor(config: Partial<StormStackNodePluginConfig> = {}) {
    super("nodejs", "@storm-stack/plugin-node");

    this.config = config as StormStackNodePluginConfig;
    this.config.style ??= StormStackNodeAppStyle.BASE;
    this.config.features ??= [];
    this.config.skipBuild ??= false;

    switch (this.config.style) {
      case StormStackNodeAppStyle.API:
        if (!this.config.features.includes(StormStackNodeFeatures.HTTP)) {
          this.config.features.push(StormStackNodeFeatures.HTTP);
        }
        break;
      case StormStackNodeAppStyle.CLI:
      case StormStackNodeAppStyle.BASE:
      default:
        break;
    }
  }

  public addHooks(hooks: EngineHooks<TOptions, TResolvedOptions>) {
    hooks.addHooks({
      "init:options": this.initOptions.bind(this),
      "init:installs": this.initInstalls.bind(this),
      "init:tsconfig": this.initTsconfig.bind(this),
      "prepare:types": this.prepareTypes.bind(this),
      "prepare:runtime": this.prepareRuntime.bind(this),
      "prepare:entry": this.prepareEntry.bind(this)
    });

    if (!this.config.skipBuild) {
      hooks.addHooks({
        "build:run": this.build.bind(this)
      });
    }
  }

  protected override async buildApp(options: TResolvedOptions) {
    this.log(LogLevelLabel.TRACE, `Building the project`);

    return this.esbuild(options);
  }

  protected async initOptions(options: TResolvedOptions) {
    this.log(
      LogLevelLabel.TRACE,
      `Resolving Storm Stack options for the project.`
    );

    options.platform ??= "node";
    options.override.format = "esm";
    options.override.target = "node22";

    options.presets.push({
      imports: ["createStormApp"],
      from: "storm:app"
    });
    options.presets.push({
      imports: ["useStorm"],
      from: "storm:context"
    });
    options.presets.push({
      imports: ["StormEvent"],
      from: "storm:event"
    });

    if (this.config.features.includes(StormStackNodeFeatures.HTTP)) {
      options.presets.push({
        imports: ["StormURL"],
        from: "@stryke/http/types",
        type: true
      });
      options.presets.push({
        imports: ["StormURLBuilder"],
        from: "@stryke/http/url-builder"
      });
    }
  }

  protected async initInstalls(options: TResolvedOptions) {
    this.log(
      LogLevelLabel.TRACE,
      `Running required installations for the project.`
    );

    await Promise.all(
      [
        this.install(options, "@types/node", true),
        options.projectType === "application" &&
          this.install(options, "@deepkit/injector"),
        options.projectType === "application" &&
          this.install(options, "@stryke/env"),
        options.projectType === "application" &&
          this.config.features.includes(StormStackNodeFeatures.HTTP) &&
          this.install(options, "@stryke/http"),
        options.projectType === "application" &&
          this.install(options, "@storm-stack/log-console")
      ].filter(Boolean)
    );
  }

  protected async initTsconfig(options: TResolvedOptions) {
    this.log(
      LogLevelLabel.TRACE,
      `Resolving TypeScript configuration in "${options.tsconfig!}"`
    );

    const tsconfig = await getParsedTypeScriptConfig(options);
    const tsconfigJson = await readJsonFile<TsConfigJson>(options.tsconfig!);

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

    return this.writeFile(options.tsconfig!, StormJSON.stringify(tsconfigJson));
  }

  protected async prepareTypes(options: TResolvedOptions) {
    if (!options.dts || !options.resolvedDotenv.types?.variables?.properties) {
      return;
    }

    const typesDir = joinPaths(options.projectRoot, options.typesDir);

    this.log(
      LogLevelLabel.TRACE,
      `Preparing the type declaration (d.ts) files in "${typesDir}"`
    );

    const runtimePath = relativePath(
      joinPaths(options.projectRoot, options.typesDir),
      joinPaths(options.projectRoot, options.runtimeDir)
    );

    await Promise.all(
      [
        this.writeFile(
          joinPaths(typesDir, "node.d.ts"),
          generateImports(runtimePath)
        ),
        this.config.features.includes(StormStackNodeFeatures.HTTP) &&
          this.writeFile(
            joinPaths(typesDir, "http.d.ts"),
            generateHttpImports()
          ),
        this.writeFile(
          joinPaths(
            options.projectRoot,
            options.dts.replace(options.projectRoot, "").trim()
          ),
          generateDeclarations(
            options.resolvedDotenv.types.variables.properties,
            this.config.features
          )
        )
      ].filter(Boolean)
    );
  }

  protected async prepareRuntime(options: TResolvedOptions) {
    const runtimeDir = joinPaths(options.projectRoot, options.runtimeDir);

    this.log(
      LogLevelLabel.TRACE,
      `Preparing the runtime files in "${runtimeDir}"`
    );

    await Promise.all([
      this.writeFile(joinPaths(runtimeDir, "app.ts"), writeCreateApp()),
      this.writeFile(joinPaths(runtimeDir, "context.ts"), writeContext()),
      this.writeFile(joinPaths(runtimeDir, "event.ts"), writeEvent())
    ]);
  }

  protected async prepareEntry(options: TResolvedOptions) {
    await Promise.all(
      options.resolvedEntry.map(async entry => {
        this.log(
          LogLevelLabel.TRACE,
          `Preparing the entry artifact ${entry.file} (${entry?.name ? `export: "${entry.name}"` : "default"})" from input "${entry.input.file} (${entry.input.name ? `export: "${entry.input.name}"` : "default"})"`
        );

        return this.writeFile(
          entry.file,
          `${getFileHeader()}

import ${entry.name ? `{ ${entry.name} }` : "handler"} from "${joinPaths(
            relativePath(
              joinPaths(options.projectRoot, findFilePath(entry.file)),
              joinPaths(options.projectRoot, findFilePath(entry.input.file))
            ),
            findFileName(entry.input.file).replace(
              findFileExtension(entry.input.file),
              ""
            )
          )}";
import { createStormApp } from ".${joinPaths(options.runtimeDir.replace(options.artifactsDir, ""), "app")}";
import { getSink } from "@storm-stack/log-console";

export default createStormApp(${entry.name ? entry.name : "handler"}, {
name: ${options.name ? `"${options.name}"` : "undefined"},
log: { handle: getSink(), logLevel: "debug" },
});

`
        );
      })
    );
  }

  /**
   * Run the esbuild process
   *
   * @param options - The esbuild options
   * @param override - Top priority build options override
   */
  private async esbuild(
    options: TResolvedOptions,
    override: Partial<ESBuildOptions> = {}
  ) {
    const runtimeDir = joinPaths(options.projectRoot, options.runtimeDir);
    const compiler = await this.getCompiler(options);

    return esbuild(
      defu(override ?? {}, options.override, {
        entry: options.resolvedEntry.map(entry => entry.file),
        projectRoot: options.projectRoot,
        outputPath: options.outputPath,
        platform: options.platform,
        generatePackageJson: true,
        minify: Boolean(options.minify),
        sourcemap: options.mode === "production",
        bundle: true,
        env: options.resolvedDotenv.values as {
          [key: string]: string;
        },
        alias: {
          "storm:app": joinPaths(runtimeDir, "app"),
          "storm:context": joinPaths(runtimeDir, "context"),
          "storm:error": joinPaths(runtimeDir, "error"),
          "storm:event": joinPaths(runtimeDir, "event"),
          "storm:log": joinPaths(runtimeDir, "log"),
          "storm:request": joinPaths(runtimeDir, "request"),
          "storm:response": joinPaths(runtimeDir, "response")
        },
        plugins: [
          externalPlugin(options, compiler.project.getCompilerOptions().paths),
          {
            name: "storm-stack:compiler",
            setup: build => {
              build.onLoad({ filter: /\.ts$/ }, async args => {
                this.log(
                  LogLevelLabel.TRACE,
                  `Transforming ${args.path} with Storm Stack compiler`
                );

                return {
                  contents: await compiler.compile(
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
