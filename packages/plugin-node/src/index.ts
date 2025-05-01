/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { build } from "@storm-software/esbuild/build";
import type { ESBuildOptions } from "@storm-software/esbuild/types";
import { reflectDotenvTypes } from "@storm-stack/core/helpers/dotenv/reflect-dotenv";
import { compilerPlugin } from "@storm-stack/core/helpers/esbuild/compiler-plugin";
import { getParsedTypeScriptConfig } from "@storm-stack/core/helpers/tsconfig";
import { getFileHeader } from "@storm-stack/core/helpers/utilities";
import { Plugin } from "@storm-stack/core/plugin";
import type { Context, EngineHooks, Options } from "@storm-stack/core/types";
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
import type { InlinePreset } from "unimport";
import {
  generateDeclarations,
  generateGlobal,
  generateImports
} from "./helpers/dtsgen";
import { preTransform } from "./helpers/pre-transform";
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
      "prepare:entry": this.prepareEntry.bind(this)
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

    context.unimportPresets.push({
      imports: ["builder"],
      from: joinPaths(runtimeDir, "app")
    });
    context.unimportPresets.push({
      imports: [
        this.#config.features.includes(StormStackNodeFeatures.ENV_PATHS) &&
          "envPaths",
        "getBuildInfo",
        "getRuntimeInfo",
        "useStorm",
        "STORM_ASYNC_CONTEXT"
      ].filter(Boolean) as InlinePreset["imports"],
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
    this.log(
      LogLevelLabel.TRACE,
      `Preparing NodeJs type declaration files (d.ts)`
    );

    const resolvedDotenvTypes = await reflectDotenvTypes(this.log, context);
    const typesDir = joinPaths(context.projectRoot, context.typesDir);

    const runtimePath = relativePath(
      joinPaths(context.projectRoot, context.typesDir),
      joinPaths(context.projectRoot, context.runtimeDir)
    );

    await Promise.all([
      this.writeFile(
        joinPaths(typesDir, "modules-node.d.ts"),
        generateImports(runtimePath, this.#config.features)
      ),
      this.writeFile(
        joinPaths(typesDir, "global-node.d.ts"),
        generateGlobal(runtimePath, this.#config.features)
      ),
      this.writeFile(
        joinPaths(typesDir, "env.d.ts"),
        generateDeclarations(
          resolvedDotenvTypes.variables,
          this.#config.features
        )
      )
    ]);
  }

  protected async prepareRuntime(context: Context<TOptions>) {
    const runtimeDir = joinPaths(context.projectRoot, context.runtimeDir);

    this.log(
      LogLevelLabel.TRACE,
      `Preparing the runtime files in "${runtimeDir}"`
    );

    await Promise.all([
      this.writeFile(
        joinPaths(runtimeDir, "init.ts"),
        writeInit(this.#config.features),
        true
      ),
      this.writeFile(
        joinPaths(runtimeDir, "app.ts"),
        writeCreateApp(this.#config.features)
      ),
      this.writeFile(
        joinPaths(runtimeDir, "context.ts"),
        writeContext(context, this.#config.features)
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

  /**
   * Run the esbuild process
   *
   * @param context - The build context
   * @param override - Top priority build options override
   */
  private async esbuild(
    context: Context<TOptions>,
    override: Partial<ESBuildOptions> & { alias?: Record<string, string> } = {}
  ) {
    const runtimeDir = joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.projectRoot,
      context.runtimeDir
    );

    const buildOptions = {
      entry: context.resolvedEntry.reduce(
        (ret, entry) => {
          ret[
            entry.output ||
              entry.input.file
                .replace(
                  `${context.projectJson?.sourceRoot || context.projectRoot}/`,
                  ""
                )
                .replace(findFileExtension(entry.input.file), "") ||
              entry.file
                .replace(
                  `${context.projectJson?.sourceRoot || context.projectRoot}/`,
                  ""
                )
                .replace(findFileExtension(entry.file), "")
          ] = entry.file;

          return ret;
        },
        {} as Record<string, string>
      ),
      mode: context.mode,
      format: context.format,
      platform: context.platform,
      projectRoot: context.projectRoot,
      outputPath: context.outputPath,
      tsconfig: context.tsconfig,
      metafile: context.mode !== "production",
      minify: Boolean(context.minify ?? context.mode === "production"),
      sourcemap: context.mode !== "production",
      banner: {
        js:
          context.mode !== "production"
            ? "\n//  ⚡  Built with Storm Stack \n"
            : " "
      },
      env: context.resolvedDotenv.values as {
        [key: string]: string;
      },
      external: context.external,
      noExternal: context.noExternal,
      skipNodeModulesBundle: context.skipNodeModulesBundle,
      assets: [
        {
          "input": context.projectRoot,
          "glob": "README.md",
          "output": "/"
        },
        {
          "input": context.projectRoot,
          "glob": "CHANGELOG.md",
          "output": "/"
        },
        {
          "input": "",
          "glob": "LICENSE",
          "output": "/"
        }
      ]
    } satisfies ESBuildOptions;

    await build(
      defu(
        {
          esbuildOptions(options) {
            options.alias = defu(
              override?.alias ?? {},
              context.override?.alias ?? {},
              {
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
            );
          },
          esbuildPlugins: [
            compilerPlugin(this.log, context, {
              onPreTransform: preTransform
            })
          ]
        },
        override ?? {},
        context.override,
        buildOptions,
        {
          dts: true,
          generatePackageJson: true,
          bundle: true,
          treeshake: true,
          shims: true,
          platform: "node",
          format: "esm",
          target: "node22",
          noExternal: [
            "storm:init",
            "storm:app",
            "storm:context",
            "storm:error",
            "storm:event",
            "storm:id",
            "storm:storage",
            "storm:log",
            "storm:request",
            "storm:response",
            "storm:json",
            "storm:url"
          ],
          skipNodeModulesBundle: true
        }
      ) as ESBuildOptions
    );
  }
}
