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

import { getWorkspaceConfig } from "@storm-software/config-tools/get-config";
import { existsSync } from "@stryke/fs/exists";
import {
  getProjectRoot,
  getWorkspaceRoot
} from "@stryke/fs/get-workspace-root";
import { joinPaths } from "@stryke/path/join-paths";
import { isFunction } from "@stryke/type-checks/is-function";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { loadConfig as loadConfigC12 } from "c12";
import defu from "defu";
import type { Jiti } from "jiti";
import { ResolvedOptions } from "../types";
import type {
  OutputConfig,
  ResolvedUserConfig,
  StormStackCommand,
  UserConfig,
  WorkspaceConfig
} from "../types/config";
import { Context } from "../types/context";
import { getTsconfigFilePath } from "./typescript/tsconfig";

export type PartiallyResolvedContext<
  TOptions extends ResolvedOptions = ResolvedOptions
> = Omit<
  Context<TOptions>,
  "options" | "tsconfig" | "entry" | "vfs" | "compiler" | "unimport"
> &
  Partial<Context<TOptions>> & {
    options: TOptions;
  };

/**
 * Loads the user configuration file for the project.
 *
 * @param projectRoot - The root directory of the project.
 * @param jiti - An instance of Jiti to resolve modules from
 * @param command - The {@link StormStackCommand} string associated with the current running process
 * @param mode - The mode in which the project is running (default is "production").
 * @returns A promise that resolves to the resolved user configuration.
 */
export async function loadUserConfigFile(
  projectRoot: string,
  jiti: Jiti,
  command?: StormStackCommand,
  mode?: string
): Promise<ResolvedUserConfig> {
  let resolvedUserConfig: Partial<ResolvedUserConfig> = {};

  const resolvedUserConfigFile = existsSync(
    joinPaths(projectRoot, "storm.config.ts")
  )
    ? joinPaths(projectRoot, "storm.config.ts")
    : existsSync(joinPaths(projectRoot, "storm.config.js"))
      ? joinPaths(projectRoot, "storm.config.js")
      : existsSync(joinPaths(projectRoot, "storm.config.mts"))
        ? joinPaths(projectRoot, "storm.config.mts")
        : existsSync(joinPaths(projectRoot, "storm.config.mjs"))
          ? joinPaths(projectRoot, "storm.config.mjs")
          : undefined;
  if (resolvedUserConfigFile) {
    const resolved = await jiti.import(jiti.esmResolve(resolvedUserConfigFile));
    if (resolved) {
      let config = {};
      if (isFunction(resolved)) {
        config = await Promise.resolve(
          resolved({
            command,
            mode: mode || "production",
            isSsrBuild: false,
            isPreview: false
          })
        );
      }

      if (isSetObject(config)) {
        resolvedUserConfig = {
          ...config,
          config: config as UserConfig,
          configFile: resolvedUserConfigFile
        };
      }
    }
  }

  const result = await Promise.all([
    loadConfigC12({
      cwd: projectRoot,
      name: "storm",
      envName: mode,
      globalRc: true,
      packageJson: true,
      dotenv: true,
      jiti
    }),
    loadConfigC12({
      cwd: projectRoot,
      name: "storm.config",
      rcFile: false,
      globalRc: false,
      packageJson: false,
      dotenv: false,
      jiti
    }),
    loadConfigC12({
      cwd: projectRoot,
      name: "storm-stack",
      envName: mode,
      globalRc: true,
      packageJson: "stormStack",
      jiti
    })
  ]);

  return defu(
    resolvedUserConfig,
    isSetObject(result[0]?.config) ? { ...result[0].config, ...result[0] } : {},
    isSetObject(result[1]?.config) ? { ...result[1].config, ...result[1] } : {},
    isSetObject(result[2]?.config) ? { ...result[2].config, ...result[2] } : {}
  ) as ResolvedUserConfig;
}

/**
 * Resolves the configuration for the project.
 *
 * @param context - The context containing options and environment paths.
 * @param inlineConfig - The inline project configuration to resolve.
 * @param userConfig - The user-defined configuration options.
 * @param projectRoot - The root directory of the project.
 * @returns A promise that resolves to the resolved project configuration options.
 */
export async function resolveConfig<
  TOptions extends ResolvedOptions = ResolvedOptions
>(
  context: PartiallyResolvedContext<TOptions>,
  inlineConfig: TOptions["inlineConfig"],
  userConfig?: TOptions["userConfig"],
  projectRoot?: string
): Promise<TOptions> {
  const resolvedProjectRoot =
    projectRoot ||
    inlineConfig.root ||
    userConfig?.root ||
    getProjectRoot() ||
    process.cwd();

  const workspaceConfig = defu(await getWorkspaceConfig(), {
    workspaceRoot:
      context.options.workspaceConfig?.workspaceRoot ?? getWorkspaceRoot()
  }) as WorkspaceConfig;
  if (!workspaceConfig) {
    throw new Error(
      "The workspace root could not be determined. Please ensure you are in a Storm Stack project."
    );
  }

  const mergedUserConfig = defu(
    { config: userConfig ?? {} },
    await loadUserConfigFile(
      resolvedProjectRoot,
      context.resolver,
      context.options.command,
      inlineConfig.mode ||
        userConfig?.mode ||
        context.options.workspaceConfig?.mode ||
        "production"
    )
  );

  const resolvedOptions = defu(
    {
      inlineConfig,
      userConfig: mergedUserConfig,
      workspaceConfig,
      projectRoot: resolvedProjectRoot,
      workspaceRoot: workspaceConfig.workspaceRoot
    },
    inlineConfig,
    mergedUserConfig.config ?? ({} as TOptions),
    {
      ...context.options,
      tsconfig: getTsconfigFilePath(
        resolvedProjectRoot,
        context.options.tsconfig ?? "tsconfig.json"
      )
    },
    {
      platform: "neutral",
      mode: "production",
      projectType: "application",
      logLevel: "info",
      isSsrBuild: false,
      isPreview: false,
      babel: {
        plugins: [],
        presets: []
      },
      build: {},
      override: {}
    }
  ) as any;

  resolvedOptions.output = defu(
    resolvedOptions.output ?? {},
    {
      outputPath: resolvedOptions.tsconfigRaw?.compilerOptions?.outDir,
      outputMode: resolvedOptions.output?.outputMode
    },
    {
      outputPath:
        resolvedProjectRoot === workspaceConfig.workspaceRoot
          ? "dist"
          : joinPaths("dist", resolvedProjectRoot),
      outputMode: "virtual",
      assets: [
        {
          input: resolvedProjectRoot,
          glob: "README.md",
          output: "/"
        },
        {
          input: resolvedProjectRoot,
          glob: "CHANGELOG.md",
          output: "/"
        },
        {
          input: "",
          glob: "LICENSE",
          output: "/"
        }
      ]
    } as OutputConfig
  );

  resolvedOptions.environment ??= defaultEnvironmentName(resolvedOptions);
  resolvedOptions.sourceRoot ??= joinPaths(resolvedOptions.projectRoot, "src");
  resolvedOptions.tsconfig ??= getTsconfigFilePath(
    resolvedOptions.projectRoot,
    resolvedOptions.tsconfig
  );

  context.options = resolvedOptions;
  context.options.logLevel =
    context.options.logLevel === "silent"
      ? null
      : context.options.logLevel === "success"
        ? "info"
        : context.options.logLevel === "trace" ||
            context.options.logLevel === "all"
          ? "debug"
          : context.options.logLevel;

  context.options.userConfig ??= {} as any;
  context.options.userConfig.plugins = mergedUserConfig.plugins ?? [];
  context.options.plugins = {
    config: {
      additionalFiles: []
    }
  };

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
export function defaultEnvironmentName(options: ResolvedOptions) {
  if (options.isSsrBuild) {
    return "ssr";
  }
  if (options.isPreview) {
    return "preview";
  }
  if (options.platform === "node" || options.isSsrBuild) {
    return "server";
  }
  if (options.platform === "browser") {
    return "client";
  }

  return "shared";
}
