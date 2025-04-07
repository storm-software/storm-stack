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
import { Plugin } from "@storm-stack/core/plugin";
import type { Context, EngineHooks, Options } from "@storm-stack/core/types";
import { joinPaths } from "@stryke/path/join-paths";
import { generateHttpImports } from "./helpers/dtsgen";
import { writeError } from "./runtime/error";

export default class StormStackHttpPlugin<
  TOptions extends Options = Options
> extends Plugin<TOptions> {
  public constructor() {
    super("http", "@storm-stack/plugin-http");
  }

  public addHooks(hooks: EngineHooks<TOptions>) {
    hooks.addHooks({
      "init:context": this.initOptions.bind(this),
      "init:installs": this.initInstalls.bind(this),
      "prepare:types": this.prepareTypes.bind(this),
      "prepare:runtime": this.prepareRuntime.bind(this)
    });
  }

  protected async initOptions(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Resolving Storm Stack context for the project.`
    );

    context.override.alias = {
      ...context.override.alias,
      "storm:http": joinPaths(context.runtimeDir, "http")
    };

    context.unimportPresets.push({
      imports: ["StormURL"],
      from: "@stryke/http/url"
    });
  }

  protected async initInstalls(context: Context<TOptions>) {
    this.log(
      LogLevelLabel.TRACE,
      `Running required installations for the project.`
    );

    await Promise.all(
      [
        context.projectType === "application" &&
          this.install(context, "@stryke/http")
      ].filter(Boolean)
    );
  }

  protected async prepareTypes(context: Context<TOptions>) {
    if (!context.dts || !context.resolvedDotenv.types?.variables?.properties) {
      return;
    }

    const typesDir = joinPaths(context.projectRoot, context.typesDir);

    this.log(
      LogLevelLabel.TRACE,
      `Preparing the type declaration (d.ts) files in "${typesDir}"`
    );

    await Promise.all(
      [
        this.writeFile(joinPaths(typesDir, "http.d.ts"), generateHttpImports())
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
      this.writeFile(joinPaths(runtimeDir, "error.ts"), writeError())
    ]);
  }
}
