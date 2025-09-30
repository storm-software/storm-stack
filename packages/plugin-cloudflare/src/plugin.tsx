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

import { code, For } from "@alloy-js/core";
import { cloudflare as cloudflareEnv } from "@cloudflare/unenv-preset";
import { cloudflare as cloudflareVitePlugin } from "@cloudflare/vite-plugin";
import { parse as parseToml, stringify as stringifyToml } from "@ltd/j-toml";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import {
  getTsconfigFilePath,
  isIncludeMatchFound,
  isMatchFound
} from "@storm-stack/core/lib/typescript/tsconfig";
import { writeFile } from "@storm-stack/core/lib/utilities/write-file";
import type {
  EngineHooks,
  ViteConfigHookParams
} from "@storm-stack/core/types/build";
import { TsupOptions } from "@storm-stack/core/types/config";
import type { PluginOptions } from "@storm-stack/core/types/plugin";
import RenderPlugin from "@storm-stack/devkit/plugins/render";
import { TypescriptFile } from "@storm-stack/devkit/templates/components/typescript-file";
import { TypescriptFileImports } from "@storm-stack/devkit/types/templates";
import { executePackage } from "@stryke/cli/execute";
import { existsSync } from "@stryke/fs/exists";
import { createDirectory, removeDirectory } from "@stryke/fs/helpers";
import { readJsonFile } from "@stryke/fs/json";
import { readFile } from "@stryke/fs/read-file";
import { removeFile } from "@stryke/fs/remove-file";
import { StormJSON } from "@stryke/json/storm-json";
import {
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { replacePath } from "@stryke/path/replace";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import defu from "defu";
import { BuildOptions as ExternalESBuildOptions } from "esbuild";
import { Format } from "tsup";
import type { Environment } from "unenv";
import { defineEnv } from "unenv";
import { ResolveOptions } from "vite";
import {
  CLOUDFLARE_MODULES,
  CLOUDFLARE_TYPES_DECLARATION,
  DEFAULT_CONDITIONS
} from "./helpers";
import { CloudflareEnvBuiltin } from "./templates/env";
import {
  CloudflarePluginContext,
  CloudflarePluginOptions
} from "./types/plugin";

/**
 * Storm Stack Cloudflare Worker Plugin
 *
 * @remarks
 * This plugin provides support for building and deploying Cloudflare Workers using Storm Stack. It integrates with the Wrangler CLI tool and sets up the necessary configurations and runtime files.
 */
export default class CloudflarePlugin<
  TContext extends CloudflarePluginContext = CloudflarePluginContext,
  TOptions extends CloudflarePluginOptions = CloudflarePluginOptions
> extends RenderPlugin<TContext, TOptions> {
  #unenv: Environment;

  public constructor(options: PluginOptions<TOptions>) {
    super(options);

    this.dependencies = [["@storm-stack/plugin-env", this.options.env ?? {}]];

    const { env } = defineEnv({
      presets: [cloudflareEnv]
    });
    this.#unenv = env;
  }

  /**
   * Adds hooks to the Storm Stack engine for the Cloudflare Worker plugin.
   *
   * @param hooks - The engine hooks to add
   */
  public override addHooks(hooks: EngineHooks<TContext>) {
    super.addHooks(hooks);

    hooks.addHooks({
      "clean:complete": this.clean.bind(this),
      "init:options": this.initOptions.bind(this),
      "init:tsconfig": this.initTsconfig.bind(this),
      "prepare:begin": this.prepareDirectories.bind(this),
      "prepare:config": this.prepareConfig.bind(this),
      "vite:config": this.viteConfig.bind(this)
    });
  }

  async clean(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Clean Cloudflare specific artifacts the Storm Stack project.`
    );

    if (context.options.projectType === "application") {
      const configPath =
        this.getOptions(context).configPath ||
        joinPaths(context.options.projectRoot, "wrangler.toml");
      if (existsSync(configPath)) {
        await removeFile(configPath);
      }
    }

    const typesDir = joinPaths(
      context.options.workspaceRoot,
      context.options.projectRoot,
      "types"
    );
    if (!existsSync(typesDir)) {
      await removeDirectory(typesDir);
    }
  }

  async initOptions(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Resolving Storm Stack context for the project.`
    );

    context.options.plugins.cloudflare ??=
      {} as Required<CloudflarePluginOptions>;
    context.options.plugins.cloudflare.configPath ??= joinPaths(
      context.options.projectRoot,
      "wrangler.toml"
    );

    context.options.platform = "node";

    context.options.override ??= {};
    if (
      context.options.variant === "esbuild" ||
      context.options.variant === "tsup" ||
      context.options.variant === "standalone"
    ) {
      context.options.override.platform = "neutral";
      // context.options.build.format = "esm";
      context.options.build.target = "chrome95";
    } else if (context.options.variant === "vite") {
      context.options.override.esbuild = { format: "esm", target: "chrome95" };

      context.options.build.build ??= {};
      context.options.build.build.target = "chrome95";

      if (this.getOptions(context).cloudflareVitePlugin !== false) {
        context.options.build.plugins ??= [];
        context.options.build.plugins.push(
          ...cloudflareVitePlugin(
            defu(this.getOptions(context).cloudflareVitePlugin ?? {}, {
              configPath: this.getOptions(context).configPath!
            })
          )
        );
      }
    }

    if (context.options.userConfig.output?.dts === undefined) {
      context.options.output.dts = joinPaths(
        context.options.projectRoot,
        "types",
        "storm.d.ts"
      );
    }

    if (Array.isArray(context.options.external)) {
      context.options.external.push(
        ...CLOUDFLARE_MODULES,
        ...this.#unenv.external
      );
    }

    context.options.noExternal ??= [];
    context.options.noExternal.push("@cloudflare/unenv-preset/node/console");
    context.options.noExternal.push("@cloudflare/unenv-preset/node/process");

    if (context.options.projectType === "application") {
      if (
        context.options.variant === "tsup" ||
        context.options.variant === "standalone"
      ) {
        context.options.build.esbuildOptions = (
          options: ExternalESBuildOptions,
          ctx: {
            format: Format;
          }
        ) => {
          (context.options.build as TsupOptions).esbuildOptions?.(options, ctx);

          options.conditions = defu(
            [...DEFAULT_CONDITIONS, "development"],
            options.conditions ?? []
          );
          options.alias = defu(options.alias ?? {}, this.#unenv.alias);
        };

        context.options.build.inject = Object.values(this.#unenv.inject)
          .filter(Boolean)
          .reduce(
            (ret: string[], inj: string | readonly string[] | boolean) => {
              if (typeof inj === "string" && !ret.includes(inj)) {
                ret.push(inj);
              } else if (Array.isArray(inj)) {
                ret.push(...inj.filter(i => !ret.includes(i)));
              }

              return ret;
            },
            [] as string[]
          );
      } else if (context.options.variant === "esbuild") {
        context.options.build.alias = defu(
          context.options.build?.alias ?? {},
          this.#unenv.alias
        );

        context.options.build.inject = Object.values(this.#unenv.inject)
          .filter(Boolean)
          .reduce(
            (ret: string[], inj: string | readonly string[] | boolean) => {
              if (typeof inj === "string" && !ret.includes(inj)) {
                ret.push(inj);
              } else if (Array.isArray(inj)) {
                ret.push(...inj.filter(i => !ret.includes(i)));
              }

              return ret;
            },
            [] as string[]
          );

        context.options.build.conditions = [
          ...DEFAULT_CONDITIONS,
          "development"
        ];
      } else if (context.options.variant === "vite") {
        context.options.build.resolve ??= {} as ResolveOptions;
        context.options.build.resolve.alias = defu(
          context.options.build.resolve?.alias ?? {},
          this.#unenv.alias
        );
        context.options.build.resolve.conditions = [
          ...DEFAULT_CONDITIONS,
          "development"
        ];

        context.options.build.define = this.#unenv.inject;
      }

      context.packageDeps["@cloudflare/unenv-preset"] = {
        "type": "dependency",
        "version": "^2.3.1"
      };
      context.packageDeps.unenv = { "type": "dependency", "version": "^2.3.1" };
      context.packageDeps.wrangler = {
        "type": "devDependency",
        "version": "^4.33.1"
      };

      context.runtimeDtsFilePath = joinPaths(
        context.options.projectRoot,
        "types",
        "storm.d.ts"
      );

      context.additionalRuntimeFiles ??= [];
      context.additionalRuntimeFiles.push(
        joinPaths(findFilePath(context.runtimeDtsFilePath), "*.ts")
      );
    }
  }

  async initTsconfig(context: TContext) {
    const tsconfigFilePath = getTsconfigFilePath(
      context.options.projectRoot,
      context.options.tsconfig
    );

    const tsconfigJson = await readJsonFile<TsConfigJson>(tsconfigFilePath);

    tsconfigJson.compilerOptions ??= {};
    tsconfigJson.compilerOptions.types ??= [];

    if (!isMatchFound("node", tsconfigJson.compilerOptions.types)) {
      tsconfigJson.compilerOptions.types.push("node");
    }

    if (
      !isMatchFound(
        CLOUDFLARE_TYPES_DECLARATION,
        tsconfigJson.compilerOptions.types
      )
    ) {
      tsconfigJson.compilerOptions.types.push(CLOUDFLARE_TYPES_DECLARATION);
    }

    // Remove Cloudflare Workers types (we're going to generate our own types)
    if (
      tsconfigJson.compilerOptions.types.some(type =>
        type.toLowerCase().startsWith("@cloudflare/workers-types")
      )
    ) {
      tsconfigJson.compilerOptions.types =
        tsconfigJson.compilerOptions.types.filter(
          type => !type.toLowerCase().startsWith("@cloudflare/workers-types")
        );
    }

    tsconfigJson.include ??= [];
    if (
      !context.options.userConfig.output?.dts &&
      isIncludeMatchFound(
        joinPaths(
          relativePath(
            joinPaths(
              context.options.workspaceRoot,
              context.options.projectRoot
            ),
            joinPaths(
              context.options.workspaceRoot,
              findFilePath(context.options.output.dts as string)
            )
          ),
          findFileName(context.options.output.dts as string, {
            withExtension: true
          })
        ),
        tsconfigJson.include
      )
    ) {
      tsconfigJson.include = tsconfigJson.include.filter(
        include =>
          !isIncludeMatchFound(
            joinPaths(
              relativePath(
                joinPaths(
                  context.options.workspaceRoot,
                  context.options.projectRoot
                ),
                joinPaths(
                  context.options.workspaceRoot,
                  findFilePath(context.options.output.dts as string)
                )
              ),
              findFileName(context.options.output.dts as string, {
                withExtension: true
              })
            ),
            [include]
          )
      );
    }

    if (!isIncludeMatchFound("types", tsconfigJson.include)) {
      tsconfigJson.include.push("types/*.d.ts");
    }

    return writeFile(
      this.log,
      tsconfigFilePath,
      StormJSON.stringify(tsconfigJson)
    );
  }

  async prepareDirectories(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the Storm Stack directories for the Cloudflare Worker project.`
    );

    // Create the types directory if it does not exist
    const typesDir = joinPaths(
      context.options.workspaceRoot,
      context.options.projectRoot,
      "types"
    );
    if (!existsSync(typesDir)) {
      await createDirectory(typesDir);
    }
  }

  async prepareConfig(context: TContext) {
    if (context.options.projectType === "application") {
      this.log(LogLevelLabel.TRACE, "Preparing the wrangler deployment file");

      let wranglerFileContent = "";

      const configPath =
        this.getOptions(context).configPath ||
        joinPaths(context.options.projectRoot, "wrangler.toml");
      if (existsSync(configPath)) {
        wranglerFileContent = await readFile(configPath);
      }

      const main = replacePath(
        context.entry && context.entry.length > 0 && context.entry[0]?.file
          ? context.entry[0].file
          : "src/index.ts",
        joinPaths(context.options.workspaceRoot, context.options.projectRoot)
      );

      if (!wranglerFileContent) {
        wranglerFileContent = `name = "${context.options.name}"
compatibility_date = "${new Date().toISOString().split("T")[0]}"
main = "${main}"

${
  process.env.CLOUDFLARE_ACCOUNT_ID
    ? `account_id = "${process.env.CLOUDFLARE_ACCOUNT_ID}"`
    : ""
}
compatibility_flags = [ "nodejs_als" ]
`;
      }

      const wranglerFile = parseToml(wranglerFileContent);

      wranglerFile.name ??= context.options.name;
      wranglerFile.compatibility_date ??= new Date()
        .toISOString()
        .split("T")[0]!;
      wranglerFile.main ??= main;
      wranglerFile.compatibility_flags ??= ["nodejs_als"];

      if (process.env.CLOUDFLARE_ACCOUNT_ID) {
        wranglerFile.account_id ??= process.env.CLOUDFLARE_ACCOUNT_ID;
      }

      await context.vfs.writeFileToDisk(
        configPath,
        stringifyToml(wranglerFile as Parameters<typeof stringifyToml>[0], {
          newline: "\n",
          newlineAround: "header",
          indent: 4,
          forceInlineArraySpacing: 0
        }),
        { skipFormat: true }
      );

      this.log(
        LogLevelLabel.TRACE,
        `Preparing the Cloudflare TypeScript declaration (d.ts) artifact for the Storm Stack project.`
      );

      await executePackage(
        "wrangler",
        [
          "types",
          `--path="${CLOUDFLARE_TYPES_DECLARATION}"`,
          "--env-interface=CloudflareEnv"
        ],
        context.options.projectRoot
      );
    }
  }

  /**
   * Prepares the runtime environment for the Storm Stack Cloudflare plugin.
   */
  protected override renderBuiltins() {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the Cloudflare runtime artifacts for the Storm Stack project.`
    );

    return <CloudflareEnvBuiltin />;
  }

  /**
   * Render the output modules for the Storm Stack Cloudflare plugin.
   */
  protected override render(context: TContext) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the Cloudflare entry artifacts for the Storm Stack project.`
    );

    context.entry.map(entry => {
      this.log(
        LogLevelLabel.TRACE,
        `Preparing the entry artifact ${entry.file} (${
          entry?.name ? `export: "${entry.name}"` : "default"
        })" from input "${entry.input.file} (${
          entry.input.name ? `export: "${entry.input.name}"` : "default"
        })"`
      );
    });

    return (
      <For each={context.entry}>
        {entry => (
          <TypescriptFile
            path={entry.file}
            imports={this.#unenv.polyfill.reduce(
              (ret, p) => {
                ret[p] = null;

                return ret;
              },
              {
                [joinPaths(
                  relativePath(
                    joinPaths(
                      context.options.projectRoot,
                      findFilePath(entry.file)
                    ),
                    joinPaths(
                      context.options.projectRoot,
                      findFilePath(entry.input.file)
                    )
                  ),
                  findFileName(entry.input.file, { withExtension: false })
                )]: entry.input.name
                  ? [{ name: entry.input.name, alias: "handle" }]
                  : [{ name: "handle", default: true }],
                "storm:context": [{ name: "withContext" }],
                "storm:request": [{ name: "StormRequest" }],
                "@storm-stack/core/deepkit/type": [
                  { name: "serialize" },
                  { name: "deserialize" }
                ]
              } as TypescriptFileImports
            )}>
            {code`
const handleRequest = withContext(handle);

export default {
  async fetch(request: Request) {
    const response = await handleRequest(request);

    return response;
  }
}
              `}
          </TypescriptFile>
        )}
      </For>
    );
  }

  /**
   * Configures Vite to use the Cloudflare plugin.
   *
   * @param context - The current build context.
   * @param params - The Vite config hook parameters.
   */
  async viteConfig(context: TContext, params: ViteConfigHookParams) {
    if (this.getOptions(context).cloudflareVitePlugin !== false) {
      params.config.plugins ??= [];
      params.config.plugins.push(
        ...cloudflareVitePlugin(
          defu(this.getOptions(context).cloudflareVitePlugin ?? {}, {
            configPath: this.getOptions(context).configPath!
          })
        )
      );
    }
  }
}
