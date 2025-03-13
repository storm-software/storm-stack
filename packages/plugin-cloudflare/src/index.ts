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

import { cloudflare } from "@cloudflare/unenv-preset";
import { parse as parseToml, stringify as stringifyToml } from "@ltd/j-toml";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { joinPaths } from "@storm-software/config-tools/utilities/correct-paths";
import { StormStackNodeAppStyle } from "@storm-stack/plugin-node/types/config";
import { readFile, readJsonFile } from "@stryke/fs/files/read-file";
import { removeFile } from "@stryke/fs/index";
import { StormJSON } from "@stryke/json/storm-json";
import { existsSync } from "@stryke/path/utilities/exists";
import {
  findFileExtension,
  findFileName,
  findFilePath,
  relativePath
} from "@stryke/path/utilities/file-path-fns";
import type { TsConfigJson } from "@stryke/types/utility-types/tsconfig";
import { getFileHeader, getParsedTypeScriptConfig } from "storm-stack/helpers";
import { Plugin } from "storm-stack/plugin";
import type {
  EngineHooks,
  InferResolvedOptions,
  Options,
  PluginConfig
} from "storm-stack/types";
import type { Environment } from "unenv";
import { defineEnv } from "unenv";
import { CLOUDFLARE_MODULES, DEFAULT_CONDITIONS } from "./helpers";

export default class CloudflarePlugin<
  TOptions extends Options = Options,
  TResolvedOptions extends
    InferResolvedOptions<TOptions> = InferResolvedOptions<TOptions>
> extends Plugin<TOptions> {
  #unenv: Environment;

  public override dependencies = [
    ["@storm-stack/plugin-node", { style: StormStackNodeAppStyle.API }]
  ] as PluginConfig[];

  public constructor() {
    super("cloudflare-worker", "@storm-stack/plugin-cloudflare");

    const { env } = defineEnv({
      presets: [cloudflare]
    });
    this.#unenv = env;
  }

  public addHooks(hooks: EngineHooks<TOptions, TResolvedOptions>) {
    hooks.addHooks({
      "clean": this.clean.bind(this),
      "init:options": this.initOptions.bind(this),
      "init:installs": this.initInstalls.bind(this),
      "init:tsconfig": this.initTsconfig.bind(this),
      "prepare:entry": this.prepareEntry.bind(this),
      "prepare:deploy": this.prepareDeploy.bind(this)
    });
  }

  protected async clean(options: TResolvedOptions) {
    this.log(
      LogLevelLabel.TRACE,
      `Clean Cloudflare specific artifacts the Storm Stack project.`
    );

    if (options.projectType === "application") {
      const wranglerFilePath = joinPaths(options.projectRoot, "wrangler.toml");
      if (wranglerFilePath) {
        await removeFile(wranglerFilePath);
      }
    }
  }

  protected async initOptions(options: TResolvedOptions) {
    this.log(
      LogLevelLabel.TRACE,
      `Resolving Storm Stack options for the project.`
    );

    options.platform = "neutral";
    options.override.format = "esm";
    options.override.target = "chrome95";

    if (options.projectType === "application") {
      options.override.alias = this.#unenv.alias;
      options.override.inject = Object.values(this.#unenv.inject)
        .filter(Boolean)
        .reduce((ret: string[], inj: string | string[]) => {
          if (typeof inj === "string" && !ret.includes(inj)) {
            ret.push(inj);
          } else if (Array.isArray(inj)) {
            ret.push(...inj.filter(i => !ret.includes(i)));
          }

          return ret;
        }, []);
      options.override.external = [
        ...CLOUDFLARE_MODULES,
        ...this.#unenv.external
      ];
      options.override.conditions = [...DEFAULT_CONDITIONS, "development"];
    }
  }

  protected async initInstalls(options: TResolvedOptions) {
    this.log(
      LogLevelLabel.TRACE,
      `Running required installations for the project.`
    );

    await Promise.all(
      [
        this.install(options, "@cloudflare/workers-types", true),
        options.projectType === "application" &&
          this.install(options, "@cloudflare/unenv-preset"),
        options.projectType === "application" && this.install(options, "unenv")
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
      !tsconfig.options.types?.some(type =>
        type.toLowerCase().includes("@cloudflare/workers-types")
      )
    ) {
      tsconfigJson.compilerOptions.types ??= [];
      tsconfigJson.compilerOptions.types.push("@cloudflare/workers-types");
    }

    return this.writeFile(options.tsconfig!, StormJSON.stringify(tsconfigJson));
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

${this.#unenv.polyfill.map(p => `import "${p}";`).join("\n")}
import ${entry.input.name ? `{ ${entry.input.name} as handler }` : "handler"} from "${joinPaths(
            relativePath(
              joinPaths(options.projectRoot, findFilePath(entry.file)),
              joinPaths(options.projectRoot, findFilePath(entry.input.file))
            ),
            findFileName(entry.input.file).replace(
              findFileExtension(entry.input.file),
              ""
            )
          )}";
import { createStormApp } from ".${joinPaths(
            options.runtimeDir.replace(options.artifactsDir, ""),
            "app"
          )}";
import { getSink } from "@storm-stack/log-console";

export default {
  fetch: createStormApp(handler, {
    name: ${options.name ? `"${options.name}"` : "undefined"},
    log: { handle: getSink(), logLevel: "debug" },
  })
}

`
        );
      })
    );
  }

  protected async prepareDeploy(options: TResolvedOptions) {
    if (options.projectType === "application") {
      this.log(LogLevelLabel.TRACE, "Preparing the wrangler deployment file");

      const wranglerFilePath = joinPaths(options.projectRoot, "wrangler.toml");
      let wranglerFileContent = "";

      if (existsSync(wranglerFilePath)) {
        wranglerFileContent = await readFile(wranglerFilePath);
      }

      if (!wranglerFileContent) {
        wranglerFileContent = `name = "${options.name}"
compatibility_date = "${new Date().toISOString().split("T")[0]}"
main = "${(options.resolvedEntry && options.resolvedEntry.length > 0 && options.resolvedEntry[0] ? options.resolvedEntry[0].file : "src/index.ts").replace(options.projectRoot, "")}"

account_id = "${process.env.CLOUDFLARE_ACCOUNT_ID}"
compatibility_flags = [ "nodejs_als" ]
`;
      }

      const wranglerFile = parseToml(wranglerFileContent);

      wranglerFile.name ??= options.name!;
      wranglerFile.compatibility_date ??= new Date()
        .toISOString()
        .split("T")[0]!;
      wranglerFile.main ??=
        options.resolvedEntry &&
        options.resolvedEntry.length > 0 &&
        options.resolvedEntry[0]
          ? options.resolvedEntry[0].file
          : "src/index.ts";
      wranglerFile.account_id ??= process.env.CLOUDFLARE_ACCOUNT_ID!;
      wranglerFile.compatibility_flags ??= ["nodejs_als"];

      return this.writeFile(
        wranglerFilePath,
        stringifyToml(wranglerFile, {
          newline: "\n",
          newlineAround: "header",
          indent: 4,
          forceInlineArraySpacing: 0
        }),
        true
      );
    }
  }
}
