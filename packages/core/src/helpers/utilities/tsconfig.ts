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

import { readJsonFile } from "@stryke/fs/read-file";
import { existsSync, joinPaths } from "@stryke/path";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import defu from "defu";
import ts from "typescript";
import type { Context, Options, ResolvedTsConfig } from "../../types/build";

export function getTsconfigFilePath<TOptions extends Options = Options>(
  context: Context<TOptions>
): string {
  const tsconfigFilePath =
    context.options.tsconfig ||
    joinPaths(context.options.projectRoot, "tsconfig.json");
  if (!existsSync(tsconfigFilePath)) {
    throw new Error(
      `Cannot find the \`tsconfig.json\` configuration file at ${tsconfigFilePath}`
    );
  }

  return tsconfigFilePath;
}

export async function getParsedTypeScriptConfig<
  TOptions extends Options = Options
>(context: Context<TOptions>): Promise<ResolvedTsConfig> {
  const tsconfigFilePath = getTsconfigFilePath(context);

  let tsconfigJson = await readJsonFile<TsConfigJson>(tsconfigFilePath);
  if (context.options.tsconfigRaw) {
    // Merge the compiler options
    tsconfigJson = defu(tsconfigJson, context.options.tsconfigRaw);
  }

  const tsconfig = ts.parseJsonConfigFileContent(
    tsconfigJson,
    ts.sys,
    context.options.projectRoot
  );
  if (tsconfig.errors.length > 0) {
    const errorMessage = `Cannot parse the compiler options provided in the \`tsconfigRaw\` option. Please investigate the following issues:
${tsconfig.errors.map(error => `- ${(error.category !== undefined && error.code ? `[${error.category}-${error.code}]: ` : "") + error.messageText.toString()}`).join("\n")}
      `;

    throw new Error(errorMessage);
  }

  return { ...tsconfig, tsconfigJson };
}
