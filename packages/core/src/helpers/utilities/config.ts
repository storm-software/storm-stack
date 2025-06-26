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

import { STORM_DEFAULT_ERROR_CODES_FILE } from "@storm-software/config/constants";
import {
  getProjectRoot,
  getWorkspaceRoot
} from "@stryke/path/get-workspace-root";
import { joinPaths } from "@stryke/path/join-paths";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { loadConfig as loadConfigC12 } from "c12";
import defu from "defu";
import type { JitiOptions } from "jiti";
import { Context, ResolvedOptions } from "../../types/build";
import type {
  InlineConfig,
  ResolvedUserConfig,
  UserConfig
} from "../../types/config";
import { getTsconfigFilePath } from "../typescript/tsconfig";

export type ConfigEnv = Pick<
  ResolvedOptions,
  "command" | "mode" | "environment" | "isSsrBuild" | "isPreview"
>;

export type UserConfigFnObject = (env: ConfigEnv) => UserConfig;
export type UserConfigFnPromise = (env: ConfigEnv) => Promise<UserConfig>;
export type UserConfigFn = (env: ConfigEnv) => UserConfig | Promise<UserConfig>;

export type UserConfigExport =
  | UserConfig
  | Promise<UserConfig>
  | UserConfigFnObject
  | UserConfigFnPromise
  | UserConfigFn;

/**
 * Type helper to make it easier to use storm.config.ts
 *
 * @remarks
 * The function accepts a direct {@link UserConfig} object, or a function that returns it. The function receives a {@link ConfigEnv} object.
 */
export function defineConfig(config: UserConfig): UserConfig;
export function defineConfig(config: Promise<UserConfig>): Promise<UserConfig>;
export function defineConfig(config: UserConfigFnObject): UserConfigFnObject;
export function defineConfig(config: UserConfigFnPromise): UserConfigFnPromise;
export function defineConfig(config: UserConfigFn): UserConfigFn;
export function defineConfig(config: UserConfigExport): UserConfigExport;
export function defineConfig(config: UserConfigExport): UserConfigExport {
  return config;
}

export async function loadUserConfigFile(
  projectRoot: string,
  mode?: string,
  cacheDir?: string
): Promise<ResolvedUserConfig> {
  let jitiOptions: JitiOptions | undefined;
  if (cacheDir) {
    jitiOptions = {
      fsCache: cacheDir,
      moduleCache: true
    };
  }

  const result = await Promise.all([
    loadConfigC12({
      cwd: projectRoot,
      name: "storm",
      envName: mode,
      globalRc: true,
      packageJson: true,
      dotenv: true,
      jitiOptions
    }),
    loadConfigC12({
      cwd: projectRoot,
      name: "storm",
      configFile: "storm",
      rcFile: false,
      globalRc: false,
      packageJson: false,
      dotenv: false,
      jitiOptions
    }),
    loadConfigC12({
      cwd: projectRoot,
      name: "storm-stack",
      envName: mode,
      globalRc: true,
      packageJson: ["storm-stack", "stormStack"],
      dotenv: true,
      jitiOptions
    }),
    loadConfigC12({
      cwd: projectRoot,
      name: "storm-stack",
      configFile: "storm-stack",
      rcFile: false,
      globalRc: false,
      packageJson: false,
      dotenv: false,
      jitiOptions
    })
  ]);

  return defu(
    isSetObject(result[0]?.config) ? { ...result[0].config, ...result[0] } : {},
    isSetObject(result[1]?.config) ? { ...result[1].config, ...result[1] } : {},
    isSetObject(result[2]?.config) ? { ...result[2].config, ...result[2] } : {},
    isSetObject(result[3]?.config) ? { ...result[3].config, ...result[3] } : {}
  ) as ResolvedUserConfig;
}

/**
 * Resolves the configuration for the project.
 *
 * @param context - The build context containing options and environment paths.
 * @param inlineConfig - The inline project configuration to resolve.
 * @param userConfig - The user-defined configuration options.
 * @returns A promise that resolves to the resolved project configuration options.
 */
export async function resolveConfig(
  context: Context,
  inlineConfig: InlineConfig,
  userConfig?: ResolvedUserConfig
): Promise<ResolvedOptions> {
  const projectRoot =
    inlineConfig.root || userConfig?.root || getProjectRoot() || process.cwd();
  const workspaceRoot =
    context.workspaceConfig?.workspaceRoot ?? getWorkspaceRoot();
  const mode =
    inlineConfig.mode ||
    userConfig?.mode ||
    context.workspaceConfig?.mode ||
    "production";

  const resolvedUserConfig = await loadUserConfigFile(
    projectRoot,
    mode,
    joinPaths(context.envPaths.cache, "jiti")
  );

  const mergedUserConfig = defu(userConfig ?? {}, resolvedUserConfig);
  const resolvedOptions = defu(
    {
      inlineConfig,
      userConfig: mergedUserConfig,
      projectRoot
    },
    inlineConfig,
    mergedUserConfig ?? {},
    {
      ...context.options,
      mode,
      outputPath:
        projectRoot === workspaceRoot ? "dist" : joinPaths("dist", projectRoot),
      tsconfig: getTsconfigFilePath(
        projectRoot,
        context.options.tsconfig || "tsconfig.json"
      )
    },
    {
      ...context.workspaceConfig,
      errorsFile: context.workspaceConfig.error?.codesFile
    },
    {
      platform: "neutral",
      mode: "production",
      projectType: "application",
      logLevel: "info",
      isSsrBuild: false,
      isPreview: false,
      errorsFile: STORM_DEFAULT_ERROR_CODES_FILE,
      alias: {},
      esbuild: {
        override: {}
      },
      unbuild: {
        override: {},
        loaders: []
      },
      assets: [
        {
          input: projectRoot,
          glob: "README.md",
          output: "/"
        },
        {
          input: projectRoot,
          glob: "CHANGELOG.md",
          output: "/"
        },
        {
          input: "",
          glob: "LICENSE",
          output: "/"
        }
      ]
    }
  ) as ResolvedOptions;

  resolvedOptions.environment ??= defaultEnvironmentName(resolvedOptions);
  context.options = resolvedOptions;

  return resolvedOptions;
}

/**
 * Returns the default environment name based on the resolved options.
 *
 * @remarks
 * The environment name is determined based on the build context, such as whether it's a server-side rendering (SSR) build, a Node.js platform, or a browser platform. If none of these conditions are met, it defaults to "shared".
 *
 * @param options - The resolved options containing the build context.
 * @returns The default environment name.
 */
export function defaultEnvironmentName(options: ResolvedOptions): string {
  if (options.isSsrBuild) {
    return "ssr";
  }
  if (options.isPreview) {
    return "preview";
  }
  if (options.platform === "node") {
    return "server";
  }
  if (options.platform === "browser") {
    return "client";
  }

  return "shared";
}
