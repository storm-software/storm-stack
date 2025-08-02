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

import { cloudflare } from "@cloudflare/unenv-preset";
import { parse as parseToml, stringify as stringifyToml } from "@ltd/j-toml";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { Plugin } from "@storm-stack/core/base/plugin";
import {
  getTsconfigFilePath,
  isIncludeMatchFound,
  isMatchFound
} from "@storm-stack/core/lib/typescript/tsconfig";
import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import { writeFile } from "@storm-stack/core/lib/utilities/write-file";
import type { EngineHooks } from "@storm-stack/core/types/build";
import type { Context } from "@storm-stack/core/types/context";
import type { PluginOptions } from "@storm-stack/core/types/plugin";
import { NodePluginConfig } from "@storm-stack/plugin-node/types";
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
import {
  CLOUDFLARE_MODULES,
  CLOUDFLARE_TYPES_DECLARATION,
  DEFAULT_CONDITIONS
} from "./helpers";

/**
 * Storm Stack Cloudflare Worker Plugin
 *
 * @remarks
 * This plugin provides support for building and deploying Cloudflare Workers using Storm Stack. It integrates with the Wrangler CLI tool and sets up the necessary configurations and runtime files.
 */
export default class StormStackCloudflareWorkerPlugin<
  TConfig extends NodePluginConfig = NodePluginConfig
> extends Plugin<TConfig> {
  #unenv: Environment;

  public constructor(options: PluginOptions<TConfig>) {
    super(options);

    this.dependencies = [["@storm-stack/plugin-node", this.options]];

    const { env } = defineEnv({
      presets: [cloudflare]
    });
    this.#unenv = env;
  }

  /**
   * Adds hooks to the Storm Stack engine for the Cloudflare Worker plugin.
   *
   * @param hooks - The engine hooks to add
   */
  public override addHooks(hooks: EngineHooks) {
    super.addHooks(hooks);

    hooks.addHooks({
      "clean:complete": this.#clean.bind(this),
      "init:options": this.#initOptions.bind(this),
      "init:tsconfig": this.#initTsconfig.bind(this),
      "prepare:begin": this.#prepareDirectories.bind(this),
      "prepare:config": this.#prepareConfig.bind(this),
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
      context.options.workspaceRoot,
      context.options.projectRoot,
      "types"
    );
    if (!existsSync(typesDir)) {
      await removeDirectory(typesDir);
    }
  }

  async #initOptions(context: Context) {
    this.log(
      LogLevelLabel.TRACE,
      `Resolving Storm Stack context for the project.`
    );

    context.options.platform = "node";

    context.options.esbuild.override ??= {};
    context.options.esbuild.override.platform = "neutral";
    context.options.esbuild.format = "esm";
    context.options.esbuild.target = "chrome95";

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

      context.packageDeps["@cloudflare/unenv-preset"] = "dependency";
      context.packageDeps.unenv = "dependency";
      context.packageDeps.wrangler = "devDependency";

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

  async #initTsconfig(context: Context) {
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
      context.options.workspaceRoot,
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

      await context.vfs.writeFileToDisk(
        wranglerFilePath,
        stringifyToml(wranglerFile, {
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
   * Prepares the runtime artifacts for the Storm Stack project.
   *
   * @param _context - The Storm Stack context
   */
  async #prepareRuntime(_context: Context) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the runtime artifacts for the Storm Stack project.`
    );
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

        return context.vfs.writeFile(
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
              findFileExtension(entry.input.file) || "",
              ""
            )
          )}";
import { withContext } from "storm:app";
import { deserialize, serialize } from "@deepkit/type";
import { StormPayload } from "storm:payload";

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
