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
import { existsSync } from "@stryke/path/exists";
import {
  getProjectRoot,
  getWorkspaceRoot
} from "@stryke/path/get-workspace-root";
import { joinPaths } from "@stryke/path/join-paths";
import { isFunction } from "@stryke/type-checks/is-function";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { loadConfig as loadConfigC12 } from "c12";
import defu from "defu";
import type { JitiOptions } from "jiti";
import { ResolvedOptions } from "../types/build";
import type {
  InlineConfig,
  OutputConfig,
  ResolvedUserConfig
} from "../types/config";
import { Context } from "../types/context";
import { getTsconfigFilePath } from "./typescript/tsconfig";

export type PartiallyResolvedContext = {
  options: Partial<Context["options"]>;
} & Omit<
  Context,
  "options" | "tsconfig" | "entry" | "vfs" | "compiler" | "unimport"
>;

/**
 * Loads the user configuration file for the project.
 *
 * @param context - The context containing options and environment paths.
 * @param projectRoot - The root directory of the project.
 * @param mode - The mode in which the project is running (default is "production").
 * @param cacheDir - Optional cache directory for Jiti.
 * @returns A promise that resolves to the resolved user configuration.
 */
export async function loadUserConfigFile(
  context: PartiallyResolvedContext,
  projectRoot: string,
  mode: string = "production",
  cacheDir?: string
): Promise<ResolvedUserConfig> {
  let jitiOptions: JitiOptions | undefined;
  if (cacheDir) {
    jitiOptions = {
      fsCache: cacheDir,
      moduleCache: true
    };
  }

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
    const resolved = await context.resolver.import(
      context.resolver.esmResolve(resolvedUserConfigFile)
    );
    if (resolved) {
      let config = {};
      if (isFunction(resolved)) {
        config = await Promise.resolve(
          resolved({
            command: context.options.command,
            mode,
            isSsrBuild: false,
            isPreview: false
          })
        );
      }

      if (isSetObject(config)) {
        resolvedUserConfig = {
          ...config,
          config,
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
    resolvedUserConfig,
    isSetObject(result[0]?.config) ? { ...result[0].config, ...result[0] } : {},
    isSetObject(result[1]?.config) ? { ...result[1].config, ...result[1] } : {},
    isSetObject(result[2]?.config) ? { ...result[2].config, ...result[2] } : {},
    isSetObject(result[3]?.config) ? { ...result[3].config, ...result[3] } : {}
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
export async function resolveConfig(
  context: PartiallyResolvedContext,
  inlineConfig: InlineConfig,
  userConfig?: ResolvedUserConfig,
  projectRoot?: string
): Promise<ResolvedOptions> {
  const resolvedProjectRoot =
    projectRoot ||
    inlineConfig.root ||
    userConfig?.root ||
    getProjectRoot() ||
    process.cwd();
  const workspaceRoot =
    context.options.workspaceConfig?.workspaceRoot ?? getWorkspaceRoot();

  if (!context.options.workspaceConfig) {
    const workspaceConfig = await getWorkspaceConfig();
    context.options.workspaceConfig = defu(workspaceConfig, {
      workspaceRoot
    });
  }
  if (!context.options.workspaceConfig?.workspaceRoot) {
    throw new Error(
      "The workspace root could not be determined. Please ensure you are in a Storm Stack project."
    );
  }

  const mode =
    inlineConfig.mode ||
    userConfig?.mode ||
    context.options.workspaceConfig?.mode ||
    "production";

  const resolvedUserConfig = await loadUserConfigFile(
    context,
    resolvedProjectRoot,
    mode,
    joinPaths(context.envPaths.cache, "jiti")
  );

  const workspaceConfig = { ...context.options.workspaceConfig };
  delete workspaceConfig.name;

  const mergedUserConfig = defu(userConfig ?? {}, resolvedUserConfig);
  const resolvedOptions = defu(
    {
      inlineConfig,
      userConfig: mergedUserConfig,
      projectRoot: resolvedProjectRoot,
      workspaceConfig: context.options.workspaceConfig
    },
    inlineConfig,
    mergedUserConfig.config ?? {},
    {
      ...context.options,
      mode,
      tsconfig: getTsconfigFilePath(
        resolvedProjectRoot,
        context.options.tsconfig || "tsconfig.json"
      )
    },
    workspaceConfig,
    {
      platform: "neutral",
      mode: "production",
      projectType: "application",
      logLevel: "info",
      templates: joinPaths(resolvedProjectRoot, "templates"),
      isSsrBuild: false,
      isPreview: false,
      babel: {
        plugins: [],
        presets: []
      },
      esbuild: {
        override: {}
      },
      unbuild: {
        override: {},
        loaders: []
      }
    }
  ) as ResolvedOptions;

  resolvedOptions.output = defu(
    resolvedOptions.output ?? {},
    {
      outputPath: resolvedOptions.tsconfigRaw?.compilerOptions?.outDir,
      outputMode: resolvedOptions.output?.outputMode
    },
    {
      outputPath:
        resolvedProjectRoot === workspaceRoot
          ? "dist"
          : joinPaths("dist", resolvedProjectRoot),
      outputMode: "memory",
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

  context.options.userConfig!.plugins = mergedUserConfig.plugins ?? [];
  context.options.plugins = {
    dotenv: {
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
  // if (options.isSsrBuild) {
  //   return "ssr";
  // }
  // if (options.isPreview) {
  //   return "preview";
  // }
  if (options.platform === "node" || options.isSsrBuild) {
    return "server";
  }
  if (options.platform === "browser") {
    return "client";
  }

  return "shared";
}
