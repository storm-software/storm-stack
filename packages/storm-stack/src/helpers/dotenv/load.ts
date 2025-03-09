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

import type { StormConfig } from "@storm-software/config/types";
import {
  loadEnv as loadEnvBase,
  loadEnvFile as loadEnvFileBase
} from "@stryke/env/load-env";
import type { DotenvParseOutput } from "@stryke/env/types";
import { joinPaths } from "@stryke/path/utilities/join-paths";
import type { PackageJson } from "@stryke/types/utility-types/package-json";
import { loadConfig } from "c12";
import defu from "defu";
import type { Options, ResolvedDotenvOptions } from "../../types/build";
import { removeEnvPrefix } from "./source-file-env";

const loadEnvFiles = async <TEnv extends DotenvParseOutput>(
  options: Options,
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

const loadEnvDirectory = async <TEnv extends DotenvParseOutput>(
  directory: string,
  options: Options,
  dotenv: ResolvedDotenvOptions,
  cacheDir: string,
  packageJson: PackageJson,
  workspaceConfig: StormConfig
): Promise<TEnv> => {
  const [envResult, c12Result] = await Promise.all([
    loadEnvFiles<TEnv>(options, directory, dotenv),
    loadConfig({
      cwd: directory,
      name: "storm",
      envName: options.mode,
      defaults: {
        NAME: packageJson.name?.replace(`@${workspaceConfig.namespace}/`, ""),
        MODE: options.mode,
        ORG: workspaceConfig.organization,
        PLATFORM: options.platform
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

export const loadEnv = async <TEnv extends DotenvParseOutput>(
  options: Options,
  dotenv: ResolvedDotenvOptions,
  cacheDir: string,
  configDir: string,
  packageJson: PackageJson,
  workspaceConfig: StormConfig
): Promise<TEnv> => {
  const [project, workspace, config] = await Promise.all([
    loadEnvDirectory(
      options.projectRoot,
      options,
      dotenv,
      cacheDir,
      packageJson,
      workspaceConfig
    ),
    loadEnvDirectory(
      workspaceConfig.workspaceRoot,
      options,
      dotenv,
      cacheDir,
      packageJson,
      workspaceConfig
    ),
    loadEnvDirectory(
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
