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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { createDirectory, removeDirectory } from "@stryke/fs/helpers";
import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import * as typedoc from "typedoc";
import type { Context, EngineHooks } from "../../types/build";
import type { LogFn } from "../../types/config";

export async function docsApiReference(
  log: LogFn,
  context: Context,
  hooks: EngineHooks
) {
  log(
    LogLevelLabel.TRACE,
    "Writing API-Reference documentation for the Storm Stack project artifacts."
  );

  // Clean and recreate the output directories
  const outputPath = joinPaths(
    context.options.projectRoot,
    "docs",
    "generated",
    "api-reference"
  );

  if (existsSync(outputPath)) {
    await removeDirectory(outputPath);
  }

  await createDirectory(outputPath);

  const app = await typedoc.Application.bootstrapWithPlugins(
    {
      plugin: [
        "typedoc-plugin-markdown",
        "typedoc-plugin-frontmatter",
        "@storm-stack/core/helpers/typedoc"
      ],
      theme: "storm-stack",
      hideGenerator: true,
      readme: "none",
      excludePrivate: true,
      gitRevision: context.workspaceConfig.branch || "main",
      entryPoints: context.entry.map(entry =>
        joinPaths(context.options.projectRoot, entry.file)
      ),
      tsconfig: context.options.tsconfig,
      exclude: context.tsconfig?.raw?.exclude,
      out: outputPath
    },
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

  await hooks.callHook("docs:api-reference", context).catch((error: Error) => {
    log(
      LogLevelLabel.ERROR,
      `An error occured while writing the API-Reference documentation for the Storm Stack project artifacts: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occured while writing the API-Reference documentation for the Storm Stack project artifacts",
      {
        cause: error
      }
    );
  });
}
