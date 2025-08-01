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

import type { Diff, ObjectData } from "@donedeal0/superdiff";
import { getObjectDiff } from "@donedeal0/superdiff";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { readJsonFile } from "@stryke/fs/json";
import { isPackageExists } from "@stryke/fs/package-fns";
import { StormJSON } from "@stryke/json/storm-json";
import { titleCase } from "@stryke/string-format/title-case";
import { TsConfigJson } from "@stryke/types/tsconfig";
import chalk from "chalk";
import {
  getParsedTypeScriptConfig,
  getTsconfigFilePath
} from "../../../lib/typescript/tsconfig";
import { writeFile } from "../../../lib/utilities/write-file";
import type { EngineHooks } from "../../../types/build";
import { Context } from "../../../types/context";
import { getTsconfigChanges } from "./utilities";

/**
 * Initializes the TypeScript configuration.
 *
 * @param context - The build context.
 * @param hooks - The engine hooks.
 */
export async function initTsconfig(
  context: Context,
  hooks: EngineHooks
): Promise<void> {
  context.log(
    LogLevelLabel.TRACE,
    "Initializing TypeScript configuration for the Storm Stack project."
  );

  if (!isPackageExists("typescript")) {
    throw new Error(
      'The TypeScript package is not installed. Please install the package using the command: "npm install typescript --save-dev"'
    );
  }

  const originalTsconfigJson = await readJsonFile<NonNullable<ObjectData>>(
    context.options.tsconfig
  );

  const json = await getTsconfigChanges(context);

  // const artifactsIncludePath = joinPaths(
  //   relativePath(
  //     joinPaths(context.options.workspaceRoot, context.options.projectRoot),
  //     context.artifactsPath
  //   ),
  //   "**/*.ts"
  // );
  // if (
  //   !json.include ||
  //   !isIncludeMatchFound(artifactsIncludePath, json.include)
  // ) {
  //   json.include ??= [];
  //   json.include.push(artifactsIncludePath);
  // }

  await writeFile(
    context.log,
    context.options.tsconfig,
    StormJSON.stringify(json)
  );

  context.tsconfig = getParsedTypeScriptConfig(
    context.options.workspaceRoot,
    context.options.projectRoot,
    context.options.tsconfig,
    context.options.tsconfigRaw
  );

  await hooks.callHook("init:tsconfig", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occured while resolving the TypeScript options: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error("An error occured while resolving the TypeScript options", {
      cause: error
    });
  });

  const tsconfigFilePath = getTsconfigFilePath(
    context.options.projectRoot,
    context.options.tsconfig
  );
  const updateTsconfigJson = await readJsonFile<TsConfigJson>(tsconfigFilePath);
  if (
    updateTsconfigJson?.compilerOptions?.types &&
    Array.isArray(updateTsconfigJson.compilerOptions.types) &&
    !updateTsconfigJson.compilerOptions.types.length
  ) {
    // If the types array is empty, we can safely remove it
    delete updateTsconfigJson.compilerOptions.types;
  }

  const result = getObjectDiff(
    originalTsconfigJson,
    updateTsconfigJson as NonNullable<ObjectData>,
    {
      ignoreArrayOrder: true,
      showOnly: {
        statuses: ["added", "deleted", "updated"],
        granularity: "deep"
      }
    }
  );

  const changes = [] as {
    field: string;
    status: "added" | "deleted" | "updated";
    previous: string;
    current: string;
  }[];
  const getChanges = (difference: Diff, property?: string) => {
    if (
      difference.status === "added" ||
      difference.status === "deleted" ||
      difference.status === "updated"
    ) {
      if (difference.diff) {
        for (const diff of difference.diff) {
          getChanges(
            diff,
            property
              ? `${property}.${difference.property}`
              : difference.property
          );
        }
      } else {
        changes.push({
          field: property
            ? `${property}.${difference.property}`
            : difference.property,
          status: difference.status,
          previous:
            difference.status === "added"
              ? "---"
              : StormJSON.stringify(difference.previousValue),
          current:
            difference.status === "deleted"
              ? "---"
              : StormJSON.stringify(difference.currentValue)
        });
      }
    }
  };

  for (const diff of result.diff) {
    getChanges(diff);
  }

  if (changes.length > 0) {
    context.log(
      LogLevelLabel.WARN,
      `Updating the following configuration values in "${tsconfigFilePath}" file:

  ${changes
    .map(
      (change, i) => `${chalk.bold.whiteBright(
        `${i + 1}. ${titleCase(change.status)} the ${change.field} field: `
      )}
  ${chalk.red(` - Previous: ${change.previous} `)}
  ${chalk.green(` - Updated: ${change.current} `)}
`
    )
    .join("\n")}
  `
    );
  }

  await writeFile(
    context.log,
    tsconfigFilePath,
    StormJSON.stringify(updateTsconfigJson)
  );

  context.tsconfig = getParsedTypeScriptConfig(
    context.options.workspaceRoot,
    context.options.projectRoot,
    context.options.tsconfig
  );
  if (!context.tsconfig) {
    throw new Error("Failed to parse the TypeScript configuration file.");
  }
}
