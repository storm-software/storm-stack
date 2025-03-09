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
import { StormStackNodeAppStyle } from "@storm-stack/plugin-node/types/config";
import { readJsonFile } from "@stryke/fs/files/read-file";
import { StormJSON } from "@stryke/json/storm-json";
import type { TsConfigJson } from "@stryke/types/utility-types/tsconfig";
import { getParsedTypeScriptConfig } from "storm-stack/helpers";
import { Plugin } from "storm-stack/plugin";
import type {
  EngineHooks,
  InferResolvedOptions,
  Options,
  PluginConfig
} from "storm-stack/types";

export default class CloudflarePlugin<
  TOptions extends Options = Options,
  TResolvedOptions extends
    InferResolvedOptions<TOptions> = InferResolvedOptions<TOptions>
> extends Plugin<TOptions> {
  public override dependencies = [
    ["@storm-stack/plugin-node", { style: StormStackNodeAppStyle.API }]
  ] as PluginConfig[];

  public constructor() {
    super("cloudflare", "@storm-stack/plugin-cloudflare");
  }

  public addHooks(hooks: EngineHooks<TOptions, TResolvedOptions>) {
    hooks.addHooks({
      "init:options": this.initOptions.bind(this),
      "init:installs": this.initInstalls.bind(this),
      "init:tsconfig": this.initTsconfig.bind(this)
    });
  }

  protected async initOptions(options: TResolvedOptions) {
    this.log(
      LogLevelLabel.TRACE,
      `Resolving Storm Stack options for the project.`
    );

    options.platform = "browser";
    options.override.format = "esm";
    options.override.target = "chrome95";
  }

  protected async initInstalls(options: TResolvedOptions) {
    this.log(
      LogLevelLabel.TRACE,
      `Running required installations for the project.`
    );

    await this.install(options, "@cloudflare/workers-types", true);
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
}
