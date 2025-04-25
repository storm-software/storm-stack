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
import {
  getFileHeader,
  getParsedTypeScriptConfig
} from "@storm-stack/core/helpers";
import { Preset } from "@storm-stack/core/preset";
import type { Context, EngineHooks, Options } from "@storm-stack/core/types";
import { readFile, readJsonFile } from "@stryke/fs/read-file";
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
import type { TsConfigJson } from "@stryke/types/tsconfig";
import defu from "defu";
import type { Environment } from "unenv";
import { defineEnv } from "unenv";
import { CLOUDFLARE_MODULES, DEFAULT_CONDITIONS } from "./helpers";

export default class StormStackCloudflareWorkerPreset<
  TOptions extends Options = Options
> extends Preset<TOptions> {
  #unenv: Environment;

  public override dependencies = [
    "@storm-stack/plugin-node",
    "@storm-stack/plugin-http"
  ];

  public constructor() {
    super("cloudflare", "@storm-stack/preset-cloudflare-worker");

    const { env } = defineEnv({
      presets: [cloudflare]
    });
    this.#unenv = env;
  }

  public addHooks(hooks: EngineHooks<TOptions>) {
    hooks.addHooks({
      "clean": this.clean.bind(this),
      "init:context": this.initOptions.bind(this),
      "init:installs": this.initInstalls.bind(this),
      "init:tsconfig": this.initTsconfig.bind(this),
      "prepare:entry": this.prepareEntry.bind(this),
      "prepare:deploy": this.prepareDeploy.bind(this)
    });
  }

  protected async clean(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Clean Cloudflare specific artifacts the Storm Stack project.`
    );

    if (context.projectType === "application") {
      const wranglerFilePath = joinPaths(context.projectRoot, "wrangler.toml");
      if (wranglerFilePath) {
        await removeFile(wranglerFilePath);
      }
    }
  }

  protected async initOptions(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Resolving Storm Stack context for the project.`
    );

    context.platform = "neutral";

    context.external ??= [];
    context.external.push(...CLOUDFLARE_MODULES, ...this.#unenv.external);

    context.noExternal ??= [];
    context.noExternal.push("@cloudflare/unenv-preset/node/console");
    context.noExternal.push("@cloudflare/unenv-preset/node/process");

    context.override.format = "esm";
    context.override.target = "chrome95";

    if (context.projectType === "application") {
      context.override.alias = defu(
        context.override.alias ?? {},
        this.#unenv.alias
      );

      context.override.inject = Object.values(this.#unenv.inject)
        .filter(Boolean)
        .reduce((ret: string[], inj: string | string[]) => {
          if (typeof inj === "string" && !ret.includes(inj)) {
            ret.push(inj);
          } else if (Array.isArray(inj)) {
            ret.push(...inj.filter(i => !ret.includes(i)));
          }

          return ret;
        }, []);

      context.override.conditions = [...DEFAULT_CONDITIONS, "development"];
    }
  }

  protected async initInstalls(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Running required installations for the project.`
    );

    await Promise.all(
      [
        this.install(context, "@cloudflare/workers-types", true),
        context.projectType === "application" &&
          this.install(context, "@cloudflare/unenv-preset"),
        context.projectType === "application" && this.install(context, "unenv")
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
      !tsconfig.options.types?.some(type =>
        type.toLowerCase().includes("@cloudflare/workers-types")
      )
    ) {
      tsconfigJson.compilerOptions.types ??= [];
      tsconfigJson.compilerOptions.types.push(
        "@cloudflare/workers-types/experimental"
      );
    }

    return this.writeFile(context.tsconfig!, StormJSON.stringify(tsconfigJson));
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

${this.#unenv.polyfill.map(p => `import "${p}";`).join("\n")}
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

import { builder } from ".${joinPaths(
            context.runtimeDir.replace(context.artifactsDir, ""),
            "app"
          )}";
import { getSink } from "@storm-stack/log-console";

export default {
  fetch: builder({
    name: ${context.name ? `"${context.name}"` : "undefined"},
    log: { handle: getSink(), logLevel: "debug" },
  })
    .handler(handle)
    .build()
}

`
        );
      })
    );
  }

  protected async prepareDeploy(context: Context<TOptions>) {
    if (context.projectType === "application") {
      this.log(LogLevelLabel.TRACE, "Preparing the wrangler deployment file");

      const wranglerFilePath = joinPaths(context.projectRoot, "wrangler.toml");
      let wranglerFileContent = "";

      if (existsSync(wranglerFilePath)) {
        wranglerFileContent = await readFile(wranglerFilePath);
      }

      if (!wranglerFileContent) {
        wranglerFileContent = `name = "${context.name}"
compatibility_date = "${new Date().toISOString().split("T")[0]}"
main = "${(context.resolvedEntry && context.resolvedEntry.length > 0 && context.resolvedEntry[0] ? context.resolvedEntry[0].file : "src/index.ts").replace(context.projectRoot, "")}"

account_id = "${process.env.CLOUDFLARE_ACCOUNT_ID}"
compatibility_flags = [ "nodejs_als" ]
`;
      }

      const wranglerFile = parseToml(wranglerFileContent);

      wranglerFile.name ??= context.name!;
      wranglerFile.compatibility_date ??= new Date()
        .toISOString()
        .split("T")[0]!;
      wranglerFile.main ??=
        context.resolvedEntry &&
        context.resolvedEntry.length > 0 &&
        context.resolvedEntry[0]
          ? context.resolvedEntry[0].file
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
