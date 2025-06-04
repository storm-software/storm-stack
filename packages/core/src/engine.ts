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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { STORM_DEFAULT_ERROR_CODES_FILE } from "@storm-software/config/constants";
import type { StormWorkspaceConfig } from "@storm-software/config/types";
import { getEnvPaths } from "@stryke/env/get-env-paths";
import { install } from "@stryke/fs/install";
import { isPackageExists } from "@stryke/fs/package-fns";
import { hash } from "@stryke/hash/hash";
import { existsSync } from "@stryke/path/exists";
import { joinPaths } from "@stryke/path/join-paths";
import { isNumber } from "@stryke/type-checks/is-number";
import defu from "defu";
import { createHooks } from "hookable";
import { createJiti } from "jiti";
import { build } from "./build";
import { clean } from "./clean";
import { docs } from "./docs";
import { finalize } from "./finalize";
import { getTsconfigFilePath } from "./helpers/typescript/tsconfig";
import { loadConfig } from "./helpers/utilities/load-config";
import { createLog } from "./helpers/utilities/logger";
import { init } from "./init";
import { lint } from "./lint";
import { _new } from "./new";
import type { Plugin } from "./plugin";
import { prepare } from "./prepare";
import type {
  Context,
  EngineHookFunctions,
  EngineHooks,
  LogFn,
  LogRuntimeConfig,
  Options,
  PluginConfig,
  StorageRuntimeConfig
} from "./types";

/**
 * The Storm Stack Engine class
 *
 * @remarks
 * This class is responsible for managing the Storm Stack project lifecycle, including initialization, building, and finalization.
 *
 * @public
 */
export class Engine<TOptions extends Options = Options> {
  #initialized = false;

  /**
   * The engine hooks - these allow the plugins to hook into the engines processing
   */
  #hooks!: EngineHooks<TOptions>;

  /**
   * The plugins provided in the options
   */
  #plugins: Plugin<TOptions>[] = [];

  /**
   * The options provided to Storm Stack
   */
  protected options: TOptions;

  /**
   * The resolved options provided to Storm Stack
   */
  protected context: Context<TOptions>;

  /**
   * The logger for the plugin
   */
  protected log: LogFn;

  public constructor(
    options: TOptions,
    workspaceConfig?: StormWorkspaceConfig
  ) {
    this.options = options;
    this.log = createLog("engine", options);

    this.context = {
      options: {
        original: options,
        ...options
      },
      override: {},
      installs: {},
      runtime: {
        logs: [] as LogRuntimeConfig[],
        storage: [] as StorageRuntimeConfig[],
        init: [] as string[]
      },
      workers: {}
    } as Context<TOptions>;

    this.context.workspaceConfig = workspaceConfig ?? {
      workspaceRoot: process.cwd()
    };

    this.context.envPaths = getEnvPaths({
      orgId: "storm-software",
      appId: "storm-stack",
      workspaceRoot: this.context.workspaceConfig?.workspaceRoot
    });
    if (!this.context.envPaths.cache) {
      throw new Error("The cache directory could not be determined.");
    }

    this.context.envPaths.cache = joinPaths(
      this.context.envPaths.cache,
      hash(options.projectRoot)
    );

    this.context.resolver = createJiti(
      joinPaths(
        this.context.workspaceConfig.workspaceRoot,
        options.projectRoot
      ),
      {
        interopDefault: true,
        fsCache: joinPaths(this.context.envPaths.cache, "jiti"),
        moduleCache: true
      }
    );
  }

  /**
   * Initialize the engine
   */
  public async init(): Promise<Context<TOptions>> {
    this.log(LogLevelLabel.TRACE, "Initializing Storm Stack engine");

    this.#hooks = createHooks<EngineHookFunctions<TOptions>>();

    const config = await loadConfig(
      this.options.projectRoot,
      this.options.mode || "production",
      joinPaths(this.context.envPaths.cache, "jiti")
    );

    this.context.options = defu(
      {
        original: this.options
      },
      this.options,
      config,
      {
        platform: "neutral",
        mode: "production",
        projectType: "application",
        outputPath: joinPaths("dist", this.options.projectRoot),
        tsconfig: getTsconfigFilePath(
          this.context.options.projectRoot,
          this.context.options.tsconfig
        ),
        errorsFile:
          this.context.workspaceConfig.error?.codesFile ||
          STORM_DEFAULT_ERROR_CODES_FILE
      }
    ) as Context<TOptions>["options"];

    for (const preset of this.context.options.presets ?? []) {
      await this.addPlugin(preset, true);
    }

    for (const plugin of this.context.options.plugins ?? []) {
      await this.addPlugin(plugin, false);
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
  public async new() {
    this.context.commandId ??= "new";

    if (!this.#initialized) {
      await this.init();
    }

    this.log(LogLevelLabel.INFO, "🆕 Creating a new Storm Stack project");

    await _new(this.log, this.context, this.#hooks);

    this.log(LogLevelLabel.TRACE, "Storm Stack - New command completed");
  }

  /**
   * Clean any previously prepared artifacts
   */
  public async clean() {
    this.context.commandId ??= "clean";

    if (!this.#initialized) {
      await this.init();
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
  public async prepare(autoClean = true) {
    this.context.commandId ??= "prepare";

    if (!this.#initialized) {
      await this.init();
    }

    if (existsSync(this.context.artifactsPath) && autoClean) {
      await this.clean();
    }

    this.log(LogLevelLabel.INFO, "Preparing the Storm Stack project");

    await prepare(this.log, this.context, this.#hooks);

    this.log(LogLevelLabel.TRACE, "Storm Stack preparation completed");
  }

  /**
   * Lint the project
   *
   * @param autoPrepare - Whether to automatically prepare the project if it has not been prepared
   * @param autoClean - Whether to automatically clean the previous build artifacts before preparing the project
   */
  public async lint(autoPrepare = true, autoClean = true) {
    this.context.commandId ??= "lint";

    if (!this.#initialized) {
      await this.init();
    }

    if (this.context.persistedMeta?.checksum !== this.context.meta.checksum) {
      if (autoPrepare) {
        this.log(
          LogLevelLabel.INFO,
          "The Storm Stack project has been modified since the last time `prepare` was ran. Re-preparing the project."
        );

        await this.prepare(autoClean);
      } else {
        throw new Error(
          "The Storm Stack project has not been prepared. Please run the `prepare` command before trying to lint the project."
        );
      }
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
  public async build(autoPrepare = true, autoClean = true) {
    this.context.commandId ??= "build";

    if (!this.#initialized) {
      await this.init();
    }

    if (this.context.persistedMeta?.checksum !== this.context.meta.checksum) {
      if (autoPrepare) {
        this.log(
          LogLevelLabel.INFO,
          "The Storm Stack project has been modified since the last time `prepare` was ran. Re-preparing the project."
        );

        await this.prepare(autoClean);
      } else {
        throw new Error(
          "The Storm Stack project has not been prepared. Please run the `prepare` command before trying to build the project."
        );
      }
    }

    this.log(LogLevelLabel.INFO, "Building the Storm Stack project");

    await build(this.log, this.context, this.#hooks);

    this.log(LogLevelLabel.TRACE, "Storm Stack build completed");
  }

  /**
   * Generate the documentation for the project
   *
   * @param autoPrepare - Whether to automatically prepare the project if it has not been prepared
   * @param autoClean - Whether to automatically clean the previous build artifacts before preparing the project
   */
  public async docs(autoPrepare = true, autoClean = true) {
    this.context.commandId ??= "docs";

    if (!this.#initialized) {
      await this.init();
    }

    if (this.context.persistedMeta?.checksum !== this.context.meta.checksum) {
      if (autoPrepare) {
        this.log(
          LogLevelLabel.INFO,
          "The Storm Stack project has been modified since the last time `prepare` was ran. Re-preparing the project."
        );

        await this.prepare(autoClean);
      } else {
        throw new Error(
          "The Storm Stack project has not been prepared. Please run the `prepare` command before trying to build the project."
        );
      }
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
   */
  public async finalize() {
    this.context.commandId ??= "finalize";

    this.log(LogLevelLabel.TRACE, "Storm Stack finalize execution started");

    await finalize(this.log, this.context, this.#hooks);

    await Promise.all(
      [
        this.context.workers.commitVars?.end(),
        this.context.workers.errorLookup?.end()
      ].filter(Boolean)
    );

    this.log(LogLevelLabel.TRACE, "Storm Stack finalize execution completed");
  }

  /**
   * Set the intent of the Storm Stack command
   *
   * @remarks
   * This is used to set the command ID for the current command being executed.
   *
   * @param commandId - The command ID to set
   */
  public setIntent(
    commandId:
      | "new"
      | "init"
      | "prepare"
      | "build"
      | "lint"
      | "docs"
      | "clean"
      | "finalize"
  ) {
    this.log(
      LogLevelLabel.TRACE,
      `Setting the Storm Stack command intent to "${commandId}"`
    );

    this.context.commandId = commandId;
  }

  /**
   * Add a Storm Stack plugin or preset to the build process
   *
   * @param config - The import path of the plugin or preset to add
   * @param isPreset - Whether the plugin is a preset
   */
  private async addPlugin(config: string | PluginConfig, isPreset = false) {
    if (config) {
      const instance = await this.initPlugin(config);
      if (instance.dependencies) {
        for (const dependency of instance.dependencies) {
          await this.addPlugin(dependency, false);
        }
      }

      this.log(
        LogLevelLabel.TRACE,
        `Successfully loaded the "${instance.name}" ${isPreset ? "preset" : "plugin"}`
      );

      this.#plugins.push(instance);
    }
  }

  /**
   * Initialize a Storm Stack plugin
   *
   * @param plugin - The import path of the plugin to add
   */
  private async initPlugin(
    plugin: string | PluginConfig
  ): Promise<Plugin<TOptions>> {
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

    let pluginInstance!: Plugin<TOptions>;
    try {
      const module = await this.context.resolver.import<{
        default: new (config: any) => Plugin<TOptions>;
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
