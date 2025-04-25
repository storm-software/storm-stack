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
import { compilerPlugin } from "@storm-stack/core/helpers/esbuild/compiler-plugin";
import { externalPlugin } from "@storm-stack/core/helpers/esbuild/external-plugin";
import { getParsedTypeScriptConfig } from "@storm-stack/core/helpers/tsconfig";
import { getFileHeader } from "@storm-stack/core/helpers/utilities";
import { Plugin } from "@storm-stack/core/plugin";
import type { Context, EngineHooks, Options } from "@storm-stack/core/types";
import type { SourceFile } from "@storm-stack/core/types/build";
import { readJsonFile } from "@stryke/fs/read-file";
import { StormJSON } from "@stryke/json/storm-json";
import {
  findFileExtension,
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import defu from "defu";
import {
  generateDeclarations,
  generateGlobal,
  generateImports
} from "./helpers/dtsgen";
import { transformContext } from "./helpers/transform-context";
import { writeCreateApp } from "./runtime/app";
import { writeContext } from "./runtime/context";
import { writeEvent } from "./runtime/event";
import { writeInit } from "./runtime/init";
import { writeStorage } from "./runtime/storage";
import type { StormStackNodePluginConfig } from "./types/config";
import { StormStackNodeFeatures } from "./types/config";

export default class StormStackNodePlugin<
  TOptions extends Options = Options
> extends Plugin<TOptions> {
  /**
   * The configuration for the Node.js plugin
   */
  #config: StormStackNodePluginConfig;

  public constructor(config: Partial<StormStackNodePluginConfig> = {}) {
    super("node", "@storm-stack/plugin-node");

    this.#config = config as StormStackNodePluginConfig;
    this.#config.features ??= [];
    this.#config.skipBuild ??= false;
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

    if (!this.#config.skipBuild) {
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

    const runtimeDir = joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.projectRoot,
      context.runtimeDir
    );

    context.platform ??= "node";
    context.override = defu(
      {
        format: "esm",
        target: "node22",
        alias: {
          "storm:init": joinPaths(runtimeDir, "init"),
          "storm:app": joinPaths(runtimeDir, "app"),
          "storm:context": joinPaths(runtimeDir, "context"),
          "storm:error": joinPaths(runtimeDir, "error"),
          "storm:event": joinPaths(runtimeDir, "event"),
          "storm:id": joinPaths(runtimeDir, "id"),
          "storm:storage": joinPaths(runtimeDir, "storage"),
          "storm:log": joinPaths(runtimeDir, "log"),
          "storm:request": joinPaths(runtimeDir, "request"),
          "storm:response": joinPaths(runtimeDir, "response"),
          "storm:json": "@stryke/json",
          "storm:url": "@stryke/url"
        }
      },
      context.override
    );

    context.unimportPresets.push({
      imports: ["builder"],
      from: joinPaths(runtimeDir, "app")
    });
    context.unimportPresets.push({
      imports: [
        "useStorm",
        "getBuildInfo",
        "getRuntimeInfo",
        "getAppName",
        "getAppVersion",
        "STORM_ASYNC_CONTEXT"
      ],
      from: joinPaths(runtimeDir, "context")
    });
    context.unimportPresets.push({
      imports: ["storage"],
      from: joinPaths(runtimeDir, "storage")
    });
    context.unimportPresets.push({
      imports: ["StormEvent"],
      from: joinPaths(runtimeDir, "event")
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
          this.install(context, "unstorage"),
        context.projectType === "application" &&
          this.install(context, "@stryke/env"),
        context.projectType === "application" &&
          this.install(context, "@storm-stack/log-console"),
        context.projectType === "application" &&
          this.#config.features.includes(StormStackNodeFeatures.SENTRY) &&
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
    if (!context.dts || !context.resolvedDotenv.types?.variables?.reflection) {
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
          joinPaths(typesDir, "modules-node.d.ts"),
          generateImports(runtimePath)
        ),
        this.writeFile(
          joinPaths(typesDir, "global-node.d.ts"),
          generateGlobal(runtimePath)
        ),
        this.writeFile(
          joinPaths(
            context.projectRoot,
            context.dts.replace(context.projectRoot, "").trim()
          ),
          generateDeclarations(
            context.resolvedDotenv.types.variables,
            this.#config.features
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
      this.writeFile(joinPaths(runtimeDir, "init.ts"), writeInit()),
      this.writeFile(joinPaths(runtimeDir, "app.ts"), writeCreateApp()),
      this.writeFile(
        joinPaths(runtimeDir, "context.ts"),
        writeContext(context)
      ),
      this.writeFile(joinPaths(runtimeDir, "storage.ts"), writeStorage()),
      this.writeFile(joinPaths(runtimeDir, "event.ts"), writeEvent())
    ]);
  }

  protected async prepareEntry(context: Context<TOptions>) {
    try {
      for (const entry of context.resolvedEntry) {
        this.log(
          LogLevelLabel.TRACE,
          `Preparing the entry artifact ${entry.file} (${entry?.name ? `export: "${entry.name}"` : "default"})" from input "${entry.input.file}" (${entry.input.name ? `export: "${entry.input.name}"` : "default"})`
        );

        await this.writeFile(
          entry.file,
          `${getFileHeader()}

import "storm:init";

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
import { builder } from "storm:app";
import { getSink as getConsoleSink } from "@storm-stack/log-console";${
            this.#config.features?.includes(StormStackNodeFeatures.SENTRY)
              ? `
import { getSink as getSentrySink } from "@storm-stack/log-sentry";`
              : ""
          }

export default builder({
  name: ${context.name ? `"${context.name}"` : "undefined"},
  log: [
    { handle: getConsoleSink(), logLevel: "debug" }${
      this.#config.features.includes(StormStackNodeFeatures.SENTRY)
        ? `,
    { handle: getSentrySink(), logLevel: "error" }`
        : ""
    }
  ],
})
  .handler(handle)
  .build();

`
        );
      }
    } catch (error) {
      this.log(
        LogLevelLabel.ERROR,
        `Failed to prepare the entry artifact: ${(error as any)?.message}`
      );
      throw error;
    }
  }

  protected async transform(
    context: Context<TOptions>,
    sourceFile: SourceFile
  ) {
    this.log(
      LogLevelLabel.TRACE,
      `Transforming the source file "${sourceFile.id}"`
    );

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
    return esbuild(
      defu(override ?? {}, context.override, {
        entry: context.resolvedEntry.reduce(
          (ret, entry) => {
            ret[
              entry.output ||
                entry.input.file
                  .replace(findFileExtension(entry.input.file), "")
                  .replace(
                    `${context.projectJson?.sourceRoot || context.projectRoot}/`,
                    ""
                  ) ||
                entry.file
            ] = entry.file;

            return ret;
          },
          {} as Record<string, string>
        ),
        projectRoot: context.projectRoot,
        outputPath: context.outputPath,
        platform: context.platform,
        generatePackageJson: true,
        bundle: true,
        minify: Boolean(context.minify),
        sourcemap: context.mode !== "production",
        banner:
          context.mode !== "production"
            ? "\n//  ⚡  Built with Storm Stack \n"
            : "",
        env: context.resolvedDotenv.values as {
          [key: string]: string;
        },
        plugins: [
          externalPlugin(
            this.log,
            context,
            context.resolvedTsconfig.tsconfigJson.compilerOptions?.paths
          ),
          compilerPlugin(this.log, context)
        ]
      }) as ESBuildOptions
    );
  }
}
