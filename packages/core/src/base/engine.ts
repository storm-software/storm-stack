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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { install } from "@stryke/fs/install";
import { isPackageExists } from "@stryke/fs/package-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { camelCase } from "@stryke/string-format/camel-case";
import { isError } from "@stryke/type-checks/is-error";
import { isNumber } from "@stryke/type-checks/is-number";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import chalk from "chalk";
import defu from "defu";
import { createHooks } from "hookable";
import { build } from "../commands/build";
import { clean } from "../commands/clean";
import { docs } from "../commands/docs";
import { finalize } from "../commands/finalize";
import { init } from "../commands/init";
import { lint } from "../commands/lint";
import { _new } from "../commands/new";
import { prepare } from "../commands/prepare";
import { createContext, getChecksum, getPersistedMeta } from "../lib/context";
import {
  isPluginConfigObject,
  isPluginInstance
} from "../lib/utilities/plugin-helpers";
import type {
  BuildInlineConfig,
  CleanInlineConfig,
  Context,
  DocsInlineConfig,
  EngineHookFunctions,
  EngineHooks,
  LintInlineConfig,
  NewInlineConfig,
  PluginConfigTuple,
  PrepareInlineConfig,
  ResolvedOptions
} from "../types";
import { PluginConfig } from "../types/config";
import type { Plugin } from "./plugin";

/**
 * The Storm Stack Engine class
 *
 * @remarks
 * This class is responsible for managing the Storm Stack project lifecycle, including initialization, building, and finalization.
 *
 * @public
 */
export class Engine<TOptions extends ResolvedOptions = ResolvedOptions> {
  /**
   * The Storm Stack context
   */
  #context!: Context<TOptions>;

  /**
   * The engine hooks - these allow the plugins to hook into the engines processing
   */
  #hooks!: EngineHooks<Context<TOptions>>;

  /**
   * The plugins provided in the options
   */
  #plugins: Plugin<Context<TOptions>>[] = [];

  /**
   * The Storm Stack context
   */
  public get context() {
    return this.#context;
  }

  /**
   * The Storm Stack engine hooks
   */
  public get hooks() {
    return this.#hooks;
  }

  /**
   * Create a new Storm Stack Engine instance
   *
   * @param inlineConfig - The inline configuration for the Storm Stack engine
   */
  private constructor(private inlineConfig: TOptions["inlineConfig"]) {}

  /**
   * Initialize the engine
   */
  public static async create<
    TOptions extends ResolvedOptions = ResolvedOptions
  >(inlineConfig: TOptions["inlineConfig"]): Promise<Engine<TOptions>> {
    const engine = new Engine<TOptions>(inlineConfig);
    await engine.init();

    return engine;
  }

  /**
   * Create a new Storm Stack project
   *
   * @remarks
   * This method will create a new Storm Stack project in the current directory.
   *
   * @param inlineConfig - The inline configuration for the new command
   * @returns A promise that resolves when the project has been created
   */
  public async new(_inlineConfig: NewInlineConfig = { command: "new" }) {
    this.#context.log(
      LogLevelLabel.INFO,
      "🆕 Creating a new Storm Stack project"
    );

    await _new(this.#context, this.#hooks);

    this.#context.log(
      LogLevelLabel.TRACE,
      "Storm Stack - New command completed"
    );
  }

  /**
   * Clean any previously prepared artifacts
   *
   * @remarks
   * This method will remove the previous Storm Stack artifacts from the project.
   *
   * @param inlineConfig - The inline configuration for the clean command
   * @returns A promise that resolves when the clean command has completed
   */
  public async clean(
    _inlineConfig: CleanInlineConfig | PrepareInlineConfig = {
      command: "clean"
    }
  ) {
    this.#context.log(
      LogLevelLabel.INFO,
      "🧹 Cleaning the previous Storm Stack artifacts"
    );

    await clean(this.#context, this.#hooks);

    this.#context.log(
      LogLevelLabel.TRACE,
      "Storm Stack - Clean command completed"
    );
  }

  /**
   * Prepare the Storm Stack project prior to building
   *
   * @remarks
   * This method will create the necessary directories, and write the artifacts files to the project.
   *
   * @param inlineConfig - The inline configuration for the prepare command
   * @returns A promise that resolves when the prepare command has completed
   */
  public async prepare(
    _inlineConfig:
      | PrepareInlineConfig
      | LintInlineConfig
      | BuildInlineConfig
      | DocsInlineConfig = {
      command: "prepare"
    }
  ) {
    // if (
    //   existsSync(this.context.artifactsPath) &&
    //   inlineConfig.command !== "lint" &&
    //   inlineConfig.clean
    // ) {
    //   await this.clean(inlineConfig as PrepareInlineConfig);
    // }

    this.#context.log(
      LogLevelLabel.INFO,
      "🏗️ Preparing the Storm Stack project"
    );

    await prepare(this.#context, this.#hooks);

    this.#context.log(LogLevelLabel.TRACE, "Storm Stack preparation completed");
  }

  /**
   * Lint the project
   *
   * @param inlineConfig - The inline configuration for the lint command
   * @returns A promise that resolves when the lint command has completed
   */
  public async lint(
    inlineConfig: LintInlineConfig | BuildInlineConfig = { command: "lint" }
  ) {
    if (this.#context.persistedMeta?.checksum !== this.#context.meta.checksum) {
      this.#context.log(
        LogLevelLabel.INFO,
        "The Storm Stack project has been modified since the last time `prepare` was ran. Re-preparing the project."
      );

      await this.prepare(inlineConfig);
    }

    this.#context.log(LogLevelLabel.INFO, "📋 Linting the Storm Stack project");

    await lint(this.#context, this.#hooks);

    this.#context.log(LogLevelLabel.TRACE, "Storm Stack linting completed");
  }

  /**
   * Build the project
   *
   * @remarks
   * This method will build the Storm Stack project, generating the necessary artifacts.
   *
   * @param inlineConfig - The inline configuration for the build command
   * @returns A promise that resolves when the build command has completed
   */
  public async build(inlineConfig: BuildInlineConfig = { command: "build" }) {
    const persistedMeta = await getPersistedMeta(this.#context);
    const checksum = await getChecksum(this.#context.options.projectRoot);

    if (persistedMeta?.checksum !== checksum) {
      this.#context.log(
        LogLevelLabel.INFO,
        "The Storm Stack project has been modified since the last time `prepare` was ran. Re-preparing the project."
      );

      await this.prepare(inlineConfig);
    }

    this.#context.log(
      LogLevelLabel.INFO,
      "📦 Building the Storm Stack project"
    );

    await build(this.#context, this.#hooks);

    this.#context.log(LogLevelLabel.TRACE, "Storm Stack build completed");
  }

  /**
   * Generate the documentation for the project
   *
   * @param inlineConfig - The inline configuration for the docs command
   * @returns A promise that resolves when the documentation generation has completed
   */
  public async docs(inlineConfig: DocsInlineConfig = { command: "docs" }) {
    if (this.#context.persistedMeta?.checksum !== this.#context.meta.checksum) {
      this.#context.log(
        LogLevelLabel.INFO,
        "The Storm Stack project has been modified since the last time `prepare` was ran. Re-preparing the project."
      );

      await this.prepare(inlineConfig);
    }

    this.#context.log(
      LogLevelLabel.INFO,
      "Generating documentation for the Storm Stack project"
    );

    await docs(this.#context, this.#hooks);

    this.#context.log(
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
   * @returns A promise that resolves when the finalization process has completed
   */
  public async finalize() {
    this.#context.log(
      LogLevelLabel.TRACE,
      "Storm Stack finalize execution started"
    );

    await finalize(this.#context, this.#hooks);

    this.#context.log(
      LogLevelLabel.TRACE,
      "Storm Stack finalize execution completed"
    );
  }

  /**
   * Initialize the engine
   */
  private async init() {
    this.#hooks = createHooks<EngineHookFunctions<Context<TOptions>>>();
    this.#context = await createContext(this.inlineConfig);

    this.#context.log(
      LogLevelLabel.TRACE,
      "⚙️ Initializing Storm Stack engine"
    );

    for (const plugin of this.#context.options.userConfig.plugins ?? []) {
      await this.addPlugin(plugin);
    }

    if (this.#plugins.length === 0) {
      this.#context.log(
        LogLevelLabel.WARN,
        "No Storm Stack plugins or presets were specified in the options. Please ensure this is correct, as it is generally not recommended."
      );
    } else {
      for (const plugin of this.#plugins) {
        plugin.addHooks(this.#hooks);
      }
    }

    await init(this.#context, this.#hooks);

    this.#context.log(
      LogLevelLabel.INFO,
      "Storm Stack engine has been initialized"
    );
  }

  /**
   * Add a Storm Stack plugin used in the build process
   *
   * @param config - The import path of the plugin to add
   */
  private async addPlugin(config: string | PluginConfig) {
    if (config) {
      const instance = await this.initPlugin(config);
      if (!instance) {
        return;
      }

      if (instance.dependencies) {
        for (const dependency of instance.dependencies) {
          await this.addPlugin(dependency);
        }
      }

      this.#context.log(
        LogLevelLabel.DEBUG,
        `Successfully initialized the ${chalk.bold.cyanBright(instance.name)} plugin`
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
  ): Promise<Plugin | null> {
    if (
      !plugin ||
      (!isSetString(plugin) &&
        !Array.isArray(plugin) &&
        !isPluginConfigObject(plugin) &&
        !isPluginInstance(plugin))
    ) {
      throw new Error(
        `Invalid plugin specified in the configuration - ${JSON.stringify(plugin)}. Please ensure the value is a plugin name, an object with the \`plugin\` and \`props\` properties, or an instance of \`Plugin\`.`
      );
    }

    let pluginInstance!: Plugin;
    if (isPluginInstance(plugin)) {
      pluginInstance = plugin;

      pluginInstance.options ??= {};
      pluginInstance.options.log ??= this.#context.log;
    } else {
      const pluginConfig: PluginConfigTuple = isSetString(plugin)
        ? [plugin, {}]
        : Array.isArray(plugin)
          ? plugin
          : [plugin.plugin, plugin.props];

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
          this.#context.options.workspaceConfig.workspaceRoot,
          this.#context.options.projectRoot
        ]
      });
      if (!isInstalled && this.#context.options.skipInstalls !== true) {
        this.#context.log(
          LogLevelLabel.WARN,
          `The plugin package "${installPath}" is not installed. It will be installed automatically.`
        );

        const result = await install(installPath, {
          cwd: this.#context.options.projectRoot
        });
        if (isNumber(result.exitCode) && result.exitCode > 0) {
          this.#context.log(LogLevelLabel.ERROR, result.stderr);
          throw new Error(
            `An error occurred while installing the build plugin package "${installPath}" `
          );
        }
      }

      try {
        // First check if the package has a "plugin" subdirectory - @scope/package/plugin
        const module = await this.#context.resolver.import<{
          plugin?: new (config: any) => Plugin;
          default: new (config: any) => Plugin;
        }>(
          this.#context.resolver.esmResolve(
            joinPaths(pluginConfig[0], "plugin")
          )
        );

        const PluginConstructor = module.plugin ?? module.default;
        pluginInstance = new PluginConstructor({
          ...(pluginConfig[1] ?? {}),
          log: this.#context.log
        });
      } catch (error) {
        try {
          const module = await this.#context.resolver.import<{
            plugin?: new (config: any) => Plugin;
            default: new (config: any) => Plugin;
          }>(this.#context.resolver.esmResolve(pluginConfig[0]));

          const PluginConstructor = module.plugin ?? module.default;
          pluginInstance = new PluginConstructor({
            ...(pluginConfig[1] ?? {}),
            log: this.#context.log
          });
        } catch {
          if (!isInstalled) {
            throw new Error(
              `The plugin package "${pluginConfig[0]}" is not installed. Please install the package using the command: "npm install ${pluginConfig[0]} --save-dev"`
            );
          } else {
            throw new Error(
              `An error occurred while importing the build plugin package "${pluginConfig[0]}":
${isError(error) ? error.message : String(error)}

Note: Please ensure the plugin package's default export is a class that extends \`Plugin\` with a constructor that excepts a single arguments of type \`PluginOptions\`.`
            );
          }
        }
      }
    }

    if (!isPluginInstance(pluginInstance)) {
      throw new Error(
        `The plugin option ${JSON.stringify(plugin)} does not export a valid module.`
      );
    }

    this.#context.options.plugins[pluginInstance.identifier] = defu(
      pluginInstance.options ?? {},
      isSetObject(this.#context.options.plugins[pluginInstance.identifier])
        ? this.#context.options.plugins[pluginInstance.identifier]
        : {},
      camelCase(pluginInstance.name) !== camelCase(pluginInstance.identifier) &&
        isSetObject(this.#context.options.plugins[pluginInstance.name])
        ? this.#context.options.plugins[pluginInstance.name]
        : {}
    );
    pluginInstance.options =
      this.#context.options.plugins[pluginInstance.identifier];

    const duplicatePlugin = this.#plugins.find(plugin =>
      plugin.isSame(pluginInstance)
    );
    if (duplicatePlugin) {
      this.#context.log(
        LogLevelLabel.TRACE,
        `Duplicate ${chalk.bold.cyanBright(duplicatePlugin.identifier)} plugin dependency detected - Skipping initialization.`
      );

      duplicatePlugin.options = defu(
        duplicatePlugin.options ?? {},
        this.#context.options.plugins[pluginInstance.identifier]
      );
      this.#context.options.plugins[duplicatePlugin.identifier] =
        duplicatePlugin.options;

      return null;
    }

    this.#context.log(
      LogLevelLabel.TRACE,
      `Initializing the ${chalk.bold.cyanBright(pluginInstance.name)} plugin...`
    );

    return pluginInstance;
  }
}
