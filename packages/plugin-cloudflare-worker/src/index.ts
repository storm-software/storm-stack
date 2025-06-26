/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { cloudflare } from "@cloudflare/unenv-preset";
import { parse as parseToml, stringify as stringifyToml } from "@ltd/j-toml";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { PluginOptions } from "@storm-stack/core/base/plugin";
import { getFileHeader, writeFile } from "@storm-stack/core/helpers";
import {
  getTsconfigFilePath,
  isIncludeMatchFound,
  isMatchFound
} from "@storm-stack/core/helpers/typescript";
import {
  writeApp,
  writeContext,
  writeEvent
} from "@storm-stack/core/prepare/runtime/node";
import type {
  Context,
  EngineHooks,
  PluginConfig
} from "@storm-stack/core/types";
import BasePlugin from "@storm-stack/devkit/plugins/base";
import { executePackage } from "@stryke/cli/execute";
import { createDirectory, removeDirectory } from "@stryke/fs/helpers";
import { readJsonFile } from "@stryke/fs/json";
import { readFile } from "@stryke/fs/read-file";
import { removeFile } from "@stryke/fs/remove-file";
import { StormJSON } from "@stryke/json/storm-json";
import { existsSync } from "@stryke/path/exists";
import {
  findFileExtension,
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { replacePath } from "@stryke/path/replace";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import defu from "defu";
import type { Environment } from "unenv";
import { defineEnv } from "unenv";
import { CLOUDFLARE_MODULES, DEFAULT_CONDITIONS } from "./helpers";

/**
 * Storm Stack Cloudflare Worker Plugin
 *
 * @remarks
 * This plugin provides support for building and deploying Cloudflare Workers using Storm Stack. It integrates with the Wrangler CLI tool and sets up the necessary configurations and runtime files.
 */
export default class StormStackCloudflareWorkerPlugin<
  TOptions extends Record<string, any> = Record<string, any>
> extends BasePlugin<TOptions> {
  #unenv: Environment;

  public override dependencies = [
    [
      "@storm-stack/plugin-log-console",
      {
        logLevel: "info"
      }
    ]
  ] as PluginConfig[];

  public constructor(options: PluginOptions<TOptions>) {
    super(options);

    const { env } = defineEnv({
      presets: [cloudflare]
    });
    this.#unenv = env;
  }

  public override innerAddHooks(hooks: EngineHooks) {
    super.innerAddHooks(hooks);

    hooks.addHooks({
      "clean:complete": this.#clean.bind(this),
      "init:context": this.#initContext.bind(this),
      "init:tsconfig": this.#initTsconfig.bind(this),
      "prepare:directories": this.#prepareDirectories.bind(this),
      "prepare:config": this.#prepareConfig.bind(this),
      "prepare:types": this.#prepareTypes.bind(this),
      "prepare:runtime": this.#prepareRuntime.bind(this),
      "prepare:entry": this.#prepareEntry.bind(this)
    });
  }

  async #clean(context: Context) {
    this.log(
      LogLevelLabel.TRACE,
      `Clean Cloudflare specific artifacts the Storm Stack project.`
    );

    if (context.options.projectType === "application") {
      const wranglerFilePath = joinPaths(
        context.options.projectRoot,
        "wrangler.toml"
      );
      if (wranglerFilePath && existsSync(wranglerFilePath)) {
        await removeFile(wranglerFilePath);
      }
    }

    const typesDir = joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      "types"
    );
    if (!existsSync(typesDir)) {
      await removeDirectory(typesDir);
    }
  }

  async #initContext(context: Context) {
    this.log(
      LogLevelLabel.TRACE,
      `Resolving Storm Stack context for the project.`
    );

    context.options.platform = "node";

    context.options.esbuild.override ??= {};
    context.options.esbuild.override.platform = "neutral";
    context.options.esbuild.format = "esm";
    context.options.esbuild.target = "chrome95";

    if (context.options.userConfig.dts === undefined) {
      context.options.dts = joinPaths(
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
      context.options.esbuild.override.alias = defu(
        context.options.esbuild.override?.alias ?? {},
        this.#unenv.alias
      );

      context.options.esbuild.override.inject = Object.values(
        this.#unenv.inject
      )
        .filter(Boolean)
        .reduce((ret: string[], inj: string | string[]) => {
          if (typeof inj === "string" && !ret.includes(inj)) {
            ret.push(inj);
          } else if (Array.isArray(inj)) {
            ret.push(...inj.filter(i => !ret.includes(i)));
          }

          return ret;
        }, []) as string[];

      context.options.esbuild.override.conditions = [
        ...DEFAULT_CONDITIONS,
        "development"
      ];

      context.installs["@cloudflare/unenv-preset"] = "dependency";
      context.installs.unenv = "dependency";
      context.installs.wrangler = "devDependency";

      context.additionalRuntimeFiles ??= [];
      context.additionalRuntimeFiles.push(
        joinPaths(context.options.projectRoot, "types", "*.ts")
      );
    }
  }

  async #initTsconfig(context: Context) {
    const tsconfigFilePath = getTsconfigFilePath(
      context.options.projectRoot,
      context.options.tsconfig
    );

    const tsconfigJson = await readJsonFile<TsConfigJson>(tsconfigFilePath);

    tsconfigJson.compilerOptions ??= {};
    tsconfigJson.compilerOptions.types ??= [];

    if (
      tsconfigJson.compilerOptions.types &&
      isMatchFound("node", tsconfigJson.compilerOptions.types)
    ) {
      tsconfigJson.compilerOptions.types =
        tsconfigJson.compilerOptions.types.filter(
          type => !isMatchFound("node", [type])
        );
    }

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
      !context.options.userConfig.dts &&
      isIncludeMatchFound(
        joinPaths(
          relativePath(
            joinPaths(
              context.workspaceConfig.workspaceRoot,
              context.options.projectRoot
            ),
            joinPaths(
              context.workspaceConfig.workspaceRoot,
              findFilePath(context.options.dts as string)
            )
          ),
          findFileName(context.options.dts as string, {
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
                  context.workspaceConfig.workspaceRoot,
                  context.options.projectRoot
                ),
                joinPaths(
                  context.workspaceConfig.workspaceRoot,
                  findFilePath(context.options.dts as string)
                )
              ),
              findFileName(context.options.dts as string, {
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

    return this.writeFile(
      context.options.tsconfig,
      StormJSON.stringify(tsconfigJson)
    );
  }

  async #prepareDirectories(context: Context) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the Storm Stack directories for the Cloudflare Worker project.`
    );

    // Create the types directory if it does not exist
    const typesDir = joinPaths(
      context.workspaceConfig.workspaceRoot,
      context.options.projectRoot,
      "types"
    );
    if (!existsSync(typesDir)) {
      await createDirectory(typesDir);
    }
  }

  async #prepareConfig(context: Context) {
    if (context.options.projectType === "application") {
      this.log(LogLevelLabel.TRACE, "Preparing the wrangler deployment file");

      const wranglerFilePath = joinPaths(
        context.options.projectRoot,
        "wrangler.toml"
      );
      let wranglerFileContent = "";

      if (existsSync(wranglerFilePath)) {
        wranglerFileContent = await readFile(wranglerFilePath);
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

      return this.writeFile(
        wranglerFilePath,
        stringifyToml(wranglerFile, {
          newline: "\n",
          newlineAround: "pairs",
          indent: 4,
          forceInlineArraySpacing: 0
        }),
        true
      );
    }
  }

  async #prepareTypes(context: Context) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the Cloudflare TypeScript declaration (d.ts) artifact for the Storm Stack project.`
    );

    await executePackage(
      "wrangler",
      [
        "types",
        '--path="types/cloudflare.d.ts"',
        "--env-interface=CloudflareEnv"
      ],
      context.options.projectRoot
    );
  }

  async #prepareRuntime(context: Context) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the runtime artifacts for the Storm Stack project.`
    );

    await Promise.all([
      writeFile(
        this.log,
        joinPaths(context.runtimePath, "app.ts"),
        writeApp(context)
      ),
      writeFile(
        this.log,
        joinPaths(context.runtimePath, "context.ts"),
        writeContext(context)
      ),
      writeFile(
        this.log,
        joinPaths(context.runtimePath, "event.ts"),
        writeEvent(context)
      )
    ]);
  }

  async #prepareEntry(context: Context) {
    await Promise.all(
      context.entry.map(async entry => {
        this.log(
          LogLevelLabel.TRACE,
          `Preparing the entry artifact ${entry.file} (${
            entry?.name ? `export: "${entry.name}"` : "default"
          })" from input "${entry.input.file} (${
            entry.input.name ? `export: "${entry.input.name}"` : "default"
          })"`
        );

        return this.writeFile(
          entry.file,
          `${getFileHeader()}

${this.#unenv.polyfill.map(p => `import "${p}";`).join("\n")}
import ${
            entry.input.name ? `{ ${entry.input.name} as handle }` : "handle"
          } from "${joinPaths(
            relativePath(
              joinPaths(context.options.projectRoot, findFilePath(entry.file)),
              joinPaths(
                context.options.projectRoot,
                findFilePath(entry.input.file)
              )
            ),
            findFileName(entry.input.file).replace(
              findFileExtension(entry.input.file),
              ""
            )
          )}";
import { withContext } from "./runtime/app";
import { deserialize, serialize } from "@deepkit/type";
import { StormPayload } from "./runtime/payload";

const handleRequest = withContext(handle);

export default {
  async fetch(request: Request) {
    const result = await handleRequest(request);

    return result;
  }
}

`
        );
      })
    );
  }
}
