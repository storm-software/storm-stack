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

import {
  loadEnv as loadEnvBase,
  loadEnvFile as loadEnvFileBase
} from "@stryke/env/load-env";
import type { DotenvParseOutput } from "@stryke/env/types";
import { joinPaths } from "@stryke/path/join-paths";
import type { PackageJson } from "@stryke/types/package-json";
import { loadConfig } from "c12";
import defu from "defu";
import { removeEnvPrefix } from "../../helpers/dotenv/source-file-env";
import type {
  Context,
  Options,
  ResolvedDotenvOptions
} from "../../types/build";

const loadEnvFiles = async <
  TOptions extends Options = Options,
  TEnv extends DotenvParseOutput = DotenvParseOutput
>(
  options: TOptions,
  cwd: string,
  dotenv: ResolvedDotenvOptions
): Promise<TEnv> => {
  let env = await loadEnvBase(cwd, options.mode);
  if (dotenv.additionalFiles.length > 0) {
    const additionalEnvFiles = await Promise.all(
      dotenv.additionalFiles.map(async additionalEnvFile =>
        loadEnvFileBase(additionalEnvFile, cwd)
      )
    );

    for (const additionalEnvFile of additionalEnvFiles) {
      env = defu(additionalEnvFile, env);
    }
  }

  return removeEnvPrefix(env) as TEnv;
};

const loadEnvDirectory = async <
  TOptions extends Options = Options,
  TEnv extends DotenvParseOutput = DotenvParseOutput
>(
  directory: string,
  options: TOptions,
  dotenv: ResolvedDotenvOptions,
  cacheDir: string,
  packageJson: PackageJson,
  workspaceConfig: Context["workspaceConfig"]
): Promise<TEnv> => {
  const [envResult, c12Result] = await Promise.all([
    loadEnvFiles<TOptions, TEnv>(options, directory, dotenv),
    loadConfig({
      cwd: directory,
      name: "storm",
      envName: options.mode,
      defaults: {
        NAME: packageJson.name?.replace(`@${workspaceConfig.namespace}/`, ""),
        MODE: options.mode,
        ORG: workspaceConfig.organization
      },
      globalRc: true,
      packageJson: true,
      dotenv: true,
      jitiOptions: {
        fsCache: joinPaths(cacheDir, "jiti"),
        moduleCache: true
      }
    })
  ]);

  return defu(envResult as any, c12Result.config, workspaceConfig) as TEnv;
};

export const loadEnv = async <
  TOptions extends Options = Options,
  TEnv extends DotenvParseOutput = DotenvParseOutput
>(
  options: TOptions,
  dotenv: ResolvedDotenvOptions,
  cacheDir: string,
  configDir: string,
  packageJson: PackageJson,
  workspaceConfig: Context["workspaceConfig"]
): Promise<TEnv> => {
  const [project, workspace, config] = await Promise.all([
    loadEnvDirectory<TOptions, TEnv>(
      options.projectRoot,
      options,
      dotenv,
      cacheDir,
      packageJson,
      workspaceConfig
    ),
    loadEnvDirectory<TOptions, TEnv>(
      workspaceConfig.workspaceRoot,
      options,
      dotenv,
      cacheDir,
      packageJson,
      workspaceConfig
    ),
    loadEnvDirectory<TOptions, TEnv>(
      configDir,
      options,
      dotenv,
      cacheDir,
      packageJson,
      workspaceConfig
    )
  ]);

  return defu(project, workspace, config) as TEnv;
};
