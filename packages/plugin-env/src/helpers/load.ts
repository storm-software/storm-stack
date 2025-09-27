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

import { WorkspaceConfig } from "@storm-stack/core/types/config";
import {
  loadEnv as loadEnvBase,
  loadEnvFile as loadEnvFileBase
} from "@stryke/env/load-env";
import type { DotenvParseOutput } from "@stryke/env/types";
import { joinPaths } from "@stryke/path/join-paths";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import type { PackageJson } from "@stryke/types/package-json";
import { loadConfig } from "c12";
import defu from "defu";
import { EnvPluginContext, EnvPluginOptions } from "../types/plugin";
import { removeEnvPrefix } from "./source-file-env";

async function loadEnvFiles<TEnv extends DotenvParseOutput = DotenvParseOutput>(
  options: EnvPluginOptions,
  mode: string,
  cwd: string
): Promise<TEnv> {
  let env = await loadEnvBase(cwd, mode);
  if (options.additionalFiles && options.additionalFiles?.length > 0) {
    const additionalEnvFiles = await Promise.all(
      options.additionalFiles.map(async additionalEnvFile =>
        loadEnvFileBase(additionalEnvFile, cwd)
      )
    );

    for (const additionalEnvFile of additionalEnvFiles) {
      env = defu(additionalEnvFile, env);
    }
  }

  return removeEnvPrefix(env) as TEnv;
}

async function loadEnvDirectory<
  TEnv extends DotenvParseOutput = DotenvParseOutput
>(
  options: EnvPluginOptions,
  directory: string,
  mode: string,
  cacheDir: string,
  packageJson: PackageJson,
  workspaceConfig: WorkspaceConfig
): Promise<TEnv> {
  const [envResult, c12Result] = await Promise.all([
    loadEnvFiles<TEnv>(options, mode, directory),
    loadConfig({
      cwd: directory,
      name: "storm",
      envName: mode,
      defaults: {
        NAME: packageJson.name?.replace(`@${workspaceConfig.namespace}/`, ""),
        MODE: mode,
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
}

/**
 * Retrieves various dotenv configuration parameters from the context.
 *
 * @param context - The context to retrieve the dotenv configuration from.
 * @param parsed - The parsed dotenv configuration.
 * @returns An object containing the dotenv configuration.
 */
export function loadEnvFromContext(
  context: EnvPluginContext,
  parsed: DotenvParseOutput
) {
  return defu(
    {
      APP_NAME: kebabCase(
        context.options.name ||
          context.packageJson.name?.replace(
            `/${context.options.workspaceConfig.namespace}`,
            ""
          )
      ),
      APP_VERSION: context.packageJson.version,
      BUILD_ID: context.meta.buildId,
      BUILD_TIMESTAMP: new Date(context.meta.timestamp).toISOString(),
      BUILD_CHECKSUM: context.meta.checksum,
      RELEASE_ID: context.meta.releaseId,
      RELEASE_TAG: `${kebabCase(context.options.name)}@${context.packageJson.version}`,
      DEFAULT_LOCALE: context.options.workspaceConfig.locale,
      DEFAULT_TIMEZONE: context.options.workspaceConfig.timezone,
      LOG_LEVEL: context.options.logLevel,
      ERROR_URL: context.options.workspaceConfig.error?.url,
      ORGANIZATION: isSetString(context.options.workspaceConfig.organization)
        ? context.options.workspaceConfig.organization
        : context.options.workspaceConfig.organization?.name,
      PLATFORM: context.options.platform,
      MODE: context.options.mode,
      DEBUG: context.options.mode === "development",
      STACKTRACE: context.options.mode === "development",
      ENVIRONMENT: context.options.environment
    },
    isSetObject(context.reflections?.env?.types?.env)
      ? context.reflections.env.types.env?.getProperties().reduce(
          (ret, prop) => {
            ret[prop.name] = parsed[prop.name] ?? prop.getDefaultValue();
            return ret;
          },
          {} as Record<string, any>
        )
      : {}
  );
}

export async function loadEnv<
  TEnv extends DotenvParseOutput = DotenvParseOutput
>(context: EnvPluginContext, options: EnvPluginOptions): Promise<TEnv> {
  const [project, workspace, config] = await Promise.all([
    loadEnvDirectory<TEnv>(
      options,
      context.options.projectRoot,
      context.options.mode,
      context.cachePath,
      context.packageJson,
      context.options.workspaceConfig
    ),
    loadEnvDirectory<TEnv>(
      options,
      context.options.workspaceRoot,
      context.options.mode,
      context.cachePath,
      context.packageJson,
      context.options.workspaceConfig
    ),
    loadEnvDirectory<TEnv>(
      options,
      context.envPaths.config,
      context.options.mode,
      context.cachePath,
      context.packageJson,
      context.options.workspaceConfig
    )
  ]);

  return defu(
    loadEnvFromContext(context, process.env),
    project,
    workspace,
    config
  ) as TEnv;
}
