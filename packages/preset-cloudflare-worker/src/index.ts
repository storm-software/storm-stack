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

import { cloudflare } from "@cloudflare/unenv-preset";
import { parse as parseToml, stringify as stringifyToml } from "@ltd/j-toml";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { getFileHeader, writeFile } from "@storm-stack/core/helpers";
import {
  getParsedTypeScriptConfig,
  getTsconfigFilePath
} from "@storm-stack/core/helpers/typescript";
import {
  writeApp,
  writeContext,
  writeEvent
} from "@storm-stack/core/prepare/runtime/node";
import { Preset } from "@storm-stack/core/preset";
import type {
  Context,
  EngineHooks,
  Options,
  PluginConfig
} from "@storm-stack/core/types";
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
    [
      "@storm-stack/plugin-log-console",
      {
        logLevel: "info"
      }
    ]
  ] as PluginConfig[];

  public constructor() {
    super("cloudflare", "@storm-stack/preset-cloudflare-worker");

    const { env } = defineEnv({
      presets: [cloudflare]
    });
    this.#unenv = env;
  }

  public addHooks(hooks: EngineHooks<TOptions>) {
    hooks.addHooks({
      "clean:complete": this.clean.bind(this),
      "init:context": this.initOptions.bind(this),
      "init:tsconfig": this.initTsconfig.bind(this),
      "prepare:runtime": this.prepareRuntime.bind(this),
      "prepare:entry": this.prepareEntry.bind(this),
      "prepare:deploy": this.prepareDeploy.bind(this)
    });
  }

  protected async clean(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Clean Cloudflare specific artifacts the Storm Stack project.`
    );

    if (context.options.projectType === "application") {
      const wranglerFilePath = joinPaths(
        context.options.projectRoot,
        "wrangler.toml"
      );
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

    context.options.platform = "node";
    context.override.platform = "neutral";
    context.override.format = "esm";
    context.override.target = "chrome95";

    context.options.external ??= [];
    context.options.external.push(
      ...CLOUDFLARE_MODULES,
      ...this.#unenv.external
    );

    context.options.noExternal ??= [];
    context.options.noExternal.push("@cloudflare/unenv-preset/node/console");
    context.options.noExternal.push("@cloudflare/unenv-preset/node/process");

    if (context.options.projectType === "application") {
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

      context.installs["@cloudflare/unenv-preset"] = "dependency";
      context.installs.unenv = "dependency";
    }

    context.installs["@cloudflare/workers-types"] = "devDependency";
  }

  protected async initTsconfig(context: Context<TOptions>) {
    const tsconfigFilePath = getTsconfigFilePath(
      context.options.projectRoot,
      context.options.tsconfig
    );

    this.log(
      LogLevelLabel.TRACE,
      `Resolving TypeScript configuration in "${tsconfigFilePath}"`
    );

    const tsconfig = await getParsedTypeScriptConfig(
      context.options.projectRoot,
      context.options.tsconfig
    );
    const tsconfigJson = await readJsonFile<TsConfigJson>(tsconfigFilePath);

    tsconfigJson.compilerOptions ??= {};
    if (
      tsconfigJson.compilerOptions.types &&
      tsconfigJson.compilerOptions.types.some(
        type => type.toLowerCase() === "@cloudflare/workers-types"
      )
    ) {
      tsconfigJson.compilerOptions.types =
        tsconfigJson.compilerOptions.types.filter(
          type => type.toLowerCase() !== "@cloudflare/workers-types"
        );
    }

    if (
      !tsconfig.options.types?.some(type =>
        type.toLowerCase().includes("@cloudflare/workers-types/experimental")
      )
    ) {
      tsconfigJson.compilerOptions.types ??= [];
      tsconfigJson.compilerOptions.types.push(
        "@cloudflare/workers-types/experimental"
      );
    }

    return this.writeFile(
      context.options.tsconfig!,
      StormJSON.stringify(tsconfigJson)
    );
  }

  protected async prepareTypes(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Preparing the TypeScript declaration (d.ts) artifacts for the Storm Stack project.`
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

  protected async prepareRuntime(context: Context<TOptions>) {
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

  protected async prepareEntry(context: Context<TOptions>) {
    await Promise.all(
      context.entry.map(async entry => {
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
import { wrap } from "./runtime/app";
import { deserialize, serialize } from "@deepkit/type";
import { StormRequest } from "./runtime/request";
import { StormResponse } from "./runtime/response";

const handleRequest = wrap(
  handle,
  {
    deserializer: (req: Request) => new StormRequest(
      deserialize(req)
    ),
    serializer: result => StormResponse.create(serialize(result))
  }
);

export default {
  async fetch(req: Request) {
    return handleRequest(req);
  }
}

`
        );
      })
    );
  }

  protected async prepareDeploy(context: Context<TOptions>) {
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

      if (!wranglerFileContent) {
        wranglerFileContent = `name = "${context.options.name}"
compatibility_date = "${new Date().toISOString().split("T")[0]}"
main = "${(context.entry && context.entry.length > 0 && context.entry[0] ? context.entry[0].file : "src/index.ts").replace(context.options.projectRoot, "")}"

account_id = "${process.env.CLOUDFLARE_ACCOUNT_ID}"
compatibility_flags = [ "nodejs_als" ]
`;
      }

      const wranglerFile = parseToml(wranglerFileContent);

      wranglerFile.name ??= context.options.name!;
      wranglerFile.compatibility_date ??= new Date()
        .toISOString()
        .split("T")[0]!;
      wranglerFile.main ??=
        context.entry && context.entry.length > 0 && context.entry[0]
          ? context.entry[0].file
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
