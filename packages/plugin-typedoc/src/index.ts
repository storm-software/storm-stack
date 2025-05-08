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

import { Plugin } from "@storm-stack/core/plugin";
import type { Context, EngineHooks, Options } from "@storm-stack/core/types";
import { createDirectory, removeDirectory } from "@stryke/fs/helpers";
import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import defu from "defu";
import * as typedoc from "typedoc";

export default class StormStackTypedocPlugin<
  TOptions extends Options = Options
> extends Plugin<TOptions> {
  public constructor() {
    super("typedoc", "@storm-stack/plugin-typedoc");
  }

  public addHooks(hooks: EngineHooks<TOptions>) {
    hooks.addHooks({
      "docs:generate": this.generateReferenceDocs.bind(this)
    });
  }

  /**
   * Generate reference documentation using TypeDoc
   *
   * @param context - The context object containing options and resolved entry points
   * @param override - The TypeDoc options to override the default ones
   */
  public async generateReferenceDocs<TOptions extends Options = Options>(
    context: Context<TOptions>,
    override: Partial<typedoc.Configuration.TypeDocOptions> = {}
  ) {
    // Clean and recreate the output directories
    const outputPath = joinPaths(
      context.options.projectRoot,
      "docs",
      "api-reference"
    );

    if (existsSync(outputPath)) {
      await removeDirectory(outputPath);
    }

    await createDirectory(outputPath);

    const app = await typedoc.Application.bootstrapWithPlugins(
      defu(override, {
        plugin: [
          "typedoc-plugin-markdown",
          "typedoc-plugin-frontmatter",
          "@storm-stack/plugin-typedoc/theme"
        ],
        theme: "storm-stack",
        hideGenerator: true,
        readme: "none",
        excludePrivate: true,
        gitRevision: context.workspaceConfig.branch || "main",
        entryPoints: context.resolvedEntry.map(entry =>
          joinPaths(context.options.projectRoot, entry.file)
        ),
        tsconfig:
          context.tsconfig ||
          joinPaths(context.options.projectRoot, "tsconfig.json"),
        exclude: context.resolvedTsconfig?.raw?.exclude,
        out: outputPath
      }),
      [
        new typedoc.TypeDocReader(),
        new typedoc.PackageJsonReader(),
        new typedoc.TSConfigReader()
      ]
    );

    const project = await app.convert();
    if (project) {
      await app.generateDocs(project, outputPath);
    }
  }
}
