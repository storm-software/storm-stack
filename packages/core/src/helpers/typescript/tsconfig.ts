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
import { replacePath } from "@stryke/path/replace";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import defu from "defu";
import ts from "typescript";
import type { ParsedTypeScriptConfig } from "../../types/build";

/**
 * Get the path to the tsconfig.json file.
 *
 * @param projectRoot - The root directory of the project.
 * @param tsconfig - The path to the tsconfig.json file.
 * @returns The absolute path to the tsconfig.json file.
 * @throws If the tsconfig.json file does not exist.
 */
export function getTsconfigFilePath(
  projectRoot: string,
  tsconfig = "tsconfig.json"
): string {
  let tsconfigFilePath = joinPaths(
    projectRoot,
    replacePath(tsconfig, projectRoot)
  );
  if (!existsSync(tsconfigFilePath)) {
    tsconfigFilePath = tsconfig;
    if (!existsSync(tsconfigFilePath)) {
      throw new Error(
        `Cannot find the \`tsconfig.json\` configuration file at ${joinPaths(
          projectRoot,
          tsconfig
        )} or ${tsconfigFilePath}`
      );
    }
  }

  return tsconfigFilePath;
}

/**
 * Get the parsed TypeScript configuration.
 *
 * @param projectRoot - The root directory of the project.
 * @param tsconfig - The path to the tsconfig.json file.
 * @param tsconfigRaw - The raw tsconfig.json content.
 * @param host - The TypeScript parse config host.
 * @returns The resolved TypeScript configuration.
 */
export async function getParsedTypeScriptConfig(
  projectRoot: string,
  tsconfig?: string,
  tsconfigRaw: TsConfigJson = {},
  host: ts.ParseConfigHost = ts.sys
): Promise<ParsedTypeScriptConfig> {
  const tsconfigFilePath = getTsconfigFilePath(projectRoot, tsconfig);
  const tsconfigJson = await readJsonFile<TsConfigJson>(tsconfigFilePath);
  if (!tsconfigJson) {
    throw new Error(
      `Cannot find the \`tsconfig.json\` configuration file at ${joinPaths(
        projectRoot,
        tsconfig ?? "tsconfig.json"
      )}`
    );
  }

  const parsedCommandLine = ts.parseJsonConfigFileContent(
    tsconfigRaw ? defu(tsconfigRaw, tsconfigJson) : tsconfigJson,
    host,
    projectRoot
  );
  if (parsedCommandLine.errors.length > 0) {
    const errorMessage = `Cannot parse the TypeScript compiler options. Please investigate the following issues:
${parsedCommandLine.errors
  .map(
    error =>
      `- ${
        (error.category !== undefined && error.code
          ? `[${error.category}-${error.code}]: `
          : "") + error.messageText.toString()
      }`
  )
  .join("\n")}
      `;

    throw new Error(errorMessage);
  }

  return {
    ...parsedCommandLine,
    tsconfigJson,
    tsconfigFilePath
  };
}
