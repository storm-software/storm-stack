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

import { createDirectory, removeDirectory } from "@stryke/fs/helpers";
import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import defu from "defu";
import * as TypeDoc from "typedoc";
import type { Context, Options } from "../../types/build";

/**
 * Generate reference documentation using TypeDoc
 *
 * @param context - The context object containing options and resolved entry points
 * @param override - The TypeDoc options to override the default ones
 */
export async function generateReferenceDocs<TOptions extends Options = Options>(
  context: Context<TOptions>,
  override: TypeDoc.Configuration.TypeDocOptions = {}
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

  const app = await TypeDoc.Application.bootstrapWithPlugins(
    defu(override, {
      plugin: [
        "typedoc-plugin-markdown",
        "typedoc-plugin-frontmatter",
        "@storm-stack/typedoc"
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
    })
  );

  const project = await app.convert();

  if (project) {
    await app.generateOutputs(project);
  }
}
