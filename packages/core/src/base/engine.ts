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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { getEnvPaths } from "@stryke/env/get-env-paths";
import { install } from "@stryke/fs/install";
import { isPackageExists } from "@stryke/fs/package-fns";
import { hash } from "@stryke/hash/hash";
import {
  getProjectRoot,
  getWorkspaceRoot
} from "@stryke/path/get-workspace-root";
import { joinPaths } from "@stryke/path/join-paths";
import { isNumber } from "@stryke/type-checks/is-number";
import defu from "defu";
import { createHooks } from "hookable";
import { createJiti } from "jiti";
import { build } from "../build";
import { clean } from "../clean";
import { docs } from "../docs";
import { finalize } from "../finalize";
import { resolveConfig } from "../helpers/utilities/config";
import { createLog } from "../helpers/utilities/logger";
import { init } from "../init";
import { lint } from "../lint";
import { _new } from "../new";
import { prepare } from "../prepare";
import type {
  BuildInlineConfig,
  CleanInlineConfig,
  Context,
  DocsInlineConfig,
  EngineHookFunctions,
  EngineHooks,
  InlineConfig,
  LintInlineConfig,
  LogFn,
  NewInlineConfig,
  PluginConfig,
  PrepareInlineConfig,
  RuntimeConfig,
  WorkspaceConfig
} from "../types";
import type { Plugin } from "./plugin";

/**
 * The Storm Stack Engine class
 *
 * @remarks
 * This class is responsible for managing the Storm Stack project lifecycle, including initialization, building, and finalization.
 *
 * @public
 */
export class Engine {
  #initialized = false;

  /**
   * The engine hooks - these allow the plugins to hook into the engines processing
   */
  #hooks!: EngineHooks;

  /**
   * The plugins provided in the options
   */
  #plugins: Plugin[] = [];

  /**
   * The options provided to Storm Stack
   */
  // protected options: TOptions;

  /**
   * The resolved options provided to Storm Stack
   */
  protected context: Context;

  /**
   * The logger for the plugin
   */
  protected log: LogFn;

  /**
   * Create a new Storm Stack Engine instance
   *
   * @param inlineConfig - The inline configuration for the Storm Stack engine
   * @param workspaceConfig  - The workspace configuration for the Storm Stack engine
   */
  public constructor(
    inlineConfig: InlineConfig,
    workspaceConfig?: WorkspaceConfig
  ) {
    this.log = createLog("engine", inlineConfig, workspaceConfig);

    const workspaceRoot = workspaceConfig?.workspaceRoot ?? getWorkspaceRoot();
    const projectRoot = inlineConfig.root || getProjectRoot() || process.cwd();

    this.context = {
      options: {
        ...inlineConfig,
        userConfig: {},
        inlineConfig,
        projectRoot
      },
      runtime: {
        logs: [],
        storage: [],
        init: []
      } as RuntimeConfig,
      installs: {},
      workers: {}
    } as Context;

    this.context.workspaceConfig = defu(workspaceConfig, {
      workspaceRoot
    });

    this.context.envPaths = getEnvPaths({
      orgId: "storm-software",
      appId: "storm-stack",
      workspaceRoot
    });
    if (!this.context.envPaths.cache) {
      throw new Error("The cache directory could not be determined.");
    }

    this.context.envPaths.cache = joinPaths(
      this.context.envPaths.cache,
      hash(projectRoot)
    );

    this.context.resolver = createJiti(joinPaths(workspaceRoot, projectRoot), {
      interopDefault: true,
      fsCache: joinPaths(this.context.envPaths.cache, "jiti"),
      moduleCache: true
    });
  }

  /**
   * Initialize the engine
   */
  public async init(inlineConfig: InlineConfig): Promise<Context> {
    this.log(LogLevelLabel.TRACE, "Initializing Storm Stack engine");

    this.#hooks = createHooks<EngineHookFunctions>();
    this.context.options = await resolveConfig(this.context, inlineConfig);

    for (const plugin of this.context.options.plugins ?? []) {
      await this.addPlugin(plugin);
    }

    if (this.#plugins.length === 0) {
      this.log(
        LogLevelLabel.WARN,
        "No Storm Stack plugins or presets were specified in the options. Please ensure this is correct, as it is generally not recommended."
      );
    } else {
      for (const plugin of this.#plugins) {
        await Promise.resolve(plugin.addHooks(this.#hooks));
      }
    }

    await init(this.log, this.context, this.#hooks);

    this.log(LogLevelLabel.INFO, "Storm Stack engine has been initialized");
    this.#initialized = true;

    return this.context;
  }

  /**
   * Create a new Storm Stack project
   */
  public async new(inlineConfig: NewInlineConfig = { command: "new" }) {
    if (!this.#initialized) {
      await this.init(inlineConfig);
    }

    this.log(LogLevelLabel.INFO, "🆕 Creating a new Storm Stack project");

    await _new(this.log, this.context, this.#hooks);

    this.log(LogLevelLabel.TRACE, "Storm Stack - New command completed");
  }

  /**
   * Clean any previously prepared artifacts
   */
  public async clean(
    inlineConfig: CleanInlineConfig | PrepareInlineConfig = { command: "clean" }
  ) {
    if (!this.#initialized) {
      await this.init(inlineConfig);
    }

    this.log(
      LogLevelLabel.INFO,
      "🧹 Cleaning the previous Storm Stack artifacts"
    );

    await clean(this.log, this.context, this.#hooks);

    this.log(LogLevelLabel.TRACE, "Storm Stack - Clean command completed");
  }

  /**
   * Prepare the Storm Stack project prior to building
   *
   * @remarks
   * This method will create the necessary directories, and write the artifacts files to the project.
   *
   * @param autoClean - Whether to automatically clean the previous build artifacts before preparing the project
   */
  public async prepare(
    inlineConfig:
      | PrepareInlineConfig
      | LintInlineConfig
      | BuildInlineConfig
      | DocsInlineConfig = {
      command: "prepare"
    }
  ) {
    if (!this.#initialized) {
      await this.init(inlineConfig);
    }

    // if (
    //   existsSync(this.context.artifactsPath) &&
    //   inlineConfig.command !== "lint" &&
    //   inlineConfig.clean
    // ) {
    //   await this.clean(inlineConfig as PrepareInlineConfig);
    // }

    this.log(LogLevelLabel.INFO, "Preparing the Storm Stack project");

    await prepare(this.log, this.context, this.#hooks);

    this.log(LogLevelLabel.TRACE, "Storm Stack preparation completed");
  }

  /**
   * Lint the project
   *
   * @param inlineConfig - The inline configuration for the lint command
   */
  public async lint(
    inlineConfig: LintInlineConfig | BuildInlineConfig = { command: "lint" }
  ) {
    if (!this.#initialized) {
      await this.init(inlineConfig);
    }

    if (this.context.persistedMeta?.checksum !== this.context.meta.checksum) {
      this.log(
        LogLevelLabel.INFO,
        "The Storm Stack project has been modified since the last time `prepare` was ran. Re-preparing the project."
      );

      await this.prepare(inlineConfig);
    }

    this.log(LogLevelLabel.INFO, "Linting the Storm Stack project");

    await lint(this.log, this.context, this.#hooks);

    this.log(LogLevelLabel.TRACE, "Storm Stack linting completed");
  }

  /**
   * Build the project
   *
   * @param autoPrepare - Whether to automatically prepare the project if it has not been prepared
   * @param autoClean - Whether to automatically clean the previous build artifacts before preparing the project
   */
  public async build(inlineConfig: BuildInlineConfig = { command: "build" }) {
    if (!this.#initialized) {
      await this.init(inlineConfig);
    }

    if (this.context.persistedMeta?.checksum !== this.context.meta.checksum) {
      this.log(
        LogLevelLabel.INFO,
        "The Storm Stack project has been modified since the last time `prepare` was ran. Re-preparing the project."
      );

      await this.prepare(inlineConfig);
    }

    this.log(LogLevelLabel.INFO, "Building the Storm Stack project");

    await build(this.log, this.context, this.#hooks);

    this.log(LogLevelLabel.TRACE, "Storm Stack build completed");
  }

  /**
   * Generate the documentation for the project
   *
   * @param inlineConfig - The inline configuration for the docs command
   */
  public async docs(inlineConfig: DocsInlineConfig = { command: "docs" }) {
    if (!this.#initialized) {
      await this.init(inlineConfig);
    }

    if (this.context.persistedMeta?.checksum !== this.context.meta.checksum) {
      this.log(
        LogLevelLabel.INFO,
        "The Storm Stack project has been modified since the last time `prepare` was ran. Re-preparing the project."
      );

      await this.prepare(inlineConfig);
    }

    this.log(
      LogLevelLabel.INFO,
      "Generating documentation for the Storm Stack project"
    );

    await docs(this.log, this.context, this.#hooks);

    this.log(
      LogLevelLabel.TRACE,
      "Storm Stack documentation generation completed"
    );
  }

  /**
   * Finalization process
   *
   * @remarks
   * This step includes any final processes or clean up required by Storm Stack. It will be run after each Storm Stack command.
   *
   * @param inlineConfig - The inline configuration for the Storm Stack engine
   */
  public async finalize(inlineConfig: InlineConfig) {
    if (!this.#initialized) {
      await this.init(inlineConfig);
    }

    this.log(LogLevelLabel.TRACE, "Storm Stack finalize execution started");

    await finalize(this.log, this.context, this.#hooks);

    this.log(LogLevelLabel.TRACE, "Storm Stack finalize execution completed");
  }

  /**
   * Add a Storm Stack plugin used in the build process
   *
   * @param config - The import path of the plugin to add
   */
  private async addPlugin(config: string | PluginConfig) {
    if (config) {
      const instance = await this.initPlugin(config);
      if (instance.dependencies) {
        for (const dependency of instance.dependencies) {
          await this.addPlugin(dependency);
        }
      }

      this.log(
        LogLevelLabel.TRACE,
        `Successfully loaded the "${instance.name}" plugin`
      );

      this.#plugins.push(instance);
    }
  }

  /**
   * Initialize a Storm Stack plugin
   *
   * @param plugin - The import path of the plugin to add
   */
  private async initPlugin(plugin: string | PluginConfig): Promise<Plugin> {
    const pluginConfig: PluginConfig =
      typeof plugin === "string" ? [plugin, {}] : plugin;

    let installPath = pluginConfig[0];
    if (
      installPath.startsWith("@") &&
      installPath.split("/").filter(Boolean).length > 2
    ) {
      const splits = installPath.split("/").filter(Boolean);
      installPath = `${splits[0]}/${splits[1]}`;
    }

    const isInstalled = isPackageExists(installPath, {
      paths: [
        this.context.workspaceConfig.workspaceRoot,
        this.context.options.projectRoot
      ]
    });
    if (!isInstalled && this.context.options.skipInstalls !== true) {
      this.log(
        LogLevelLabel.WARN,
        `The plugin package "${installPath}" is not installed. It will be installed automatically.`
      );

      const result = await install(installPath, {
        cwd: this.context.options.projectRoot
      });
      if (isNumber(result.exitCode) && result.exitCode > 0) {
        this.log(LogLevelLabel.ERROR, result.stderr);
        throw new Error(
          `An error occurred while installing the build plugin package "${installPath}" `
        );
      }
    }

    let pluginInstance!: Plugin;
    try {
      const module = await this.context.resolver.import<{
        default: new (config: any) => Plugin;
      }>(this.context.resolver.esmResolve(pluginConfig[0]));
      const PluginConstructor = module.default;

      pluginInstance = new PluginConstructor(pluginConfig[1]);
    } catch (error) {
      if (!isInstalled) {
        throw new Error(
          `The plugin package "${pluginConfig[0]}" is not installed. Please install the package using the command: "npm install ${pluginConfig[0]} --save-dev"`
        );
      } else {
        throw new Error(
          `An error occurred while importing the build plugin package "${pluginConfig[0]}":
${error.message}

Note: Please ensure the plugin package's default export is a class that extends \`Plugin\` with a constructor that excepts zero arguments.`
        );
      }
    }

    if (!pluginInstance) {
      throw new Error(
        `The plugin package "${pluginConfig[0]}" does not export a valid module.`
      );
    }

    if (!pluginInstance.name) {
      throw new Error(
        `The module in the build plugin package "${pluginConfig[0]}" must export a \`name\` string value.`
      );
    }

    if (!pluginInstance.addHooks) {
      throw new Error(
        `The build plugin "${pluginInstance.name}" must export an \`addHooks\` function.`
      );
    }

    this.log(
      LogLevelLabel.TRACE,
      `Successfully initialized the "${pluginInstance.name}" plugin`
    );

    return pluginInstance;
  }
}
