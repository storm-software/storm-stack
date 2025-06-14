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

import { readJsonFile } from "@stryke/fs/json";
import { existsSync, joinPaths } from "@stryke/path";
import { replacePath } from "@stryke/path/replace";
import { FilterPattern } from "@stryke/types/file";
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
  let tsconfigFilePath = tsconfig;
  if (!existsSync(tsconfigFilePath)) {
    tsconfigFilePath = joinPaths(
      projectRoot,
      replacePath(tsconfig, projectRoot)
    );
    if (!existsSync(tsconfigFilePath)) {
      throw new Error(
        `Cannot find the \`tsconfig.json\` configuration file at ${joinPaths(
          projectRoot,
          replacePath(tsconfig, projectRoot)
        )} or ${tsconfigFilePath}`
      );
    }
  }

  return tsconfigFilePath;
}

/**
 * Check if the TypeScript configuration type matches any of the provided types.
 *
 * @param tsconfigType - The type from the TypeScript configuration.
 * @param types - An array of type names to check against.
 * @returns True if the TypeScript configuration type matches any of the provided types, false otherwise.
 */
export function findMatch(
  tsconfigType: string | RegExp | null,
  types: (string | RegExp | null)[],
  extensions: string[] = [".ts", ".tsx", ".d.ts"]
): string | RegExp | null | undefined {
  return types.find(
    type =>
      tsconfigType?.toString().toLowerCase() ===
        type?.toString().toLowerCase() ||
      tsconfigType?.toString().toLowerCase() ===
        `./${type?.toString().toLowerCase()}` ||
      `./${tsconfigType?.toString().toLowerCase()}` ===
        type?.toString().toLowerCase() ||
      extensions.some(
        ext =>
          `${tsconfigType?.toString().toLowerCase()}${ext}` ===
            type?.toString().toLowerCase() ||
          `${tsconfigType?.toString().toLowerCase()}${ext}` ===
            `./${type?.toString().toLowerCase()}` ||
          `${type?.toString().toLowerCase()}${ext}` ===
            `./${tsconfigType?.toString().toLowerCase()}` ||
          tsconfigType?.toString().toLowerCase() ===
            `${type?.toString().toLowerCase()}${ext}` ||
          tsconfigType?.toString().toLowerCase() ===
            `./${type?.toString().toLowerCase()}${ext}` ||
          type?.toString().toLowerCase() ===
            `./${tsconfigType?.toString().toLowerCase()}${ext}`
      )
  );
}

/**
 * Check if the TypeScript configuration type matches any of the provided types.
 *
 * @param tsconfigType - The type from the TypeScript configuration.
 * @param types - An array of type names to check against.
 * @returns True if the TypeScript configuration type matches any of the provided types, false otherwise.
 */
export function findIncludeMatch(
  tsconfigType: string | RegExp | null,
  types: (string | RegExp | null)[]
): string | RegExp | null | undefined {
  return findMatch(tsconfigType, types, [
    ".ts",
    ".tsx",
    ".d.ts",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".mts",
    ".cts",
    "/*.ts",
    "/*.tsx",
    "/*.d.ts",
    "/*.js",
    "/*.jsx",
    "/*.mjs",
    "/*.cjs",
    "/*.mts",
    "/*.cts",
    "/**/*.ts",
    "/**/*.tsx",
    "/**/*.d.ts",
    "/**/*.js",
    "/**/*.jsx",
    "/**/*.mjs",
    "/**/*.cjs",
    "/**/*.mts",
    "/**/*.cts"
  ]);
}

/**
 * Check if the TypeScript configuration type matches any of the provided types.
 *
 * @param tsconfigType - The type from the TypeScript configuration.
 * @param types - An array of type names to check against.
 * @returns True if the TypeScript configuration type matches any of the provided types, false otherwise.
 */
export function isMatchFound(
  tsconfigType: string | RegExp | null,
  types: (string | RegExp | null)[]
): boolean {
  return findMatch(tsconfigType, types) !== undefined;
}

/**
 * Check if the TypeScript configuration type matches any of the provided types.
 *
 * @param tsconfigType - The type from the TypeScript configuration.
 * @param types - An array of type names to check against.
 * @returns True if the TypeScript configuration type matches any of the provided types, false otherwise.
 */
export function isIncludeMatchFound(
  tsconfigType: FilterPattern,
  types: FilterPattern[]
): boolean {
  return (
    findIncludeMatch(
      tsconfigType as string | RegExp | null,
      types as (string | RegExp | null)[]
    ) !== undefined
  );
}

/**
 * Get the parsed TypeScript configuration.
 *
 * @param projectRoot - The root directory of the project.
 * @param tsconfig - The path to the tsconfig.json file.
 * @param tsconfigRaw - The raw tsconfig.json content.
 * @param excludeFiles - An array of type names to exclude from the TypeScript configuration.
 * @param host - The TypeScript parse config host.
 * @returns The resolved TypeScript configuration.
 */
export async function getParsedTypeScriptConfig(
  projectRoot: string,
  tsconfig?: string,
  tsconfigRaw: TsConfigJson = {},
  excludeFiles = [] as (string | RegExp | null)[],
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

  const resolvedTsconfig = tsconfigRaw
    ? defu(tsconfigRaw, tsconfigJson)
    : tsconfigJson;

  if (excludeFiles.length > 0) {
    resolvedTsconfig.include ??= [];
    resolvedTsconfig.include = resolvedTsconfig.include.filter(
      fileName =>
        !isMatchFound(fileName as string | RegExp | null, excludeFiles)
    );
  }

  const parsedCommandLine = ts.parseJsonConfigFileContent(
    resolvedTsconfig,
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
