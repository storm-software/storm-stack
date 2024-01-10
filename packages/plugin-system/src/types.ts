import { StormDateTime } from "@storm-stack/date-time";
import { MaybePromise } from "@storm-stack/utilities";

export type PluginDiscoveryMode = "auto" | "fallback" | "none";
export const PluginDiscoveryMode = {
  AUTO: "auto" as PluginDiscoveryMode,
  FALLBACK: "fallback" as PluginDiscoveryMode,
  NONE: "none" as PluginDiscoveryMode
};

export interface PluginManagerConfig {
  /**
   * The path to the root of the application.
   */
  rootPath: string;

  /**
   * Should node_modules be used to discover plugins?
   *
   * @default true
   */
  useNodeModules: boolean;

  /**
   * A mode specifying how plugins should be discovered from the local filesystem.
   *
   * @remarks
   * `auto` - Automatically discover all plugins in the rootPath
   * `fallback` - Discover plugins in the rootPath if a registered plugin provider is not found
   * `none` - Do not discover plugins in the rootPath, regardless of whether a registered plugin provider is found or not
   *
   * @default "fallback"
   */
  discoveryMode: PluginDiscoveryMode;

  /**
   * The path to the plugin's module loader.
   */
  defaultLoader: string;
}

export interface PluginDefinition {
  /**
   * The id of the plugin.
   */
  id: string;

  /**
   * The plugin provider path/package name that provides this plugin.
   */
  provider: string;

  /**
   * The name of the plugin.
   */
  name: string;

  /**
   * The version of the plugin.
   */
  version: string;

  /**
   * A description of the plugin.
   */
  description?: string;

  /**
   * The plugin's base path/path to the package.json file
   */
  packagePath: string;

  /**
   * The path to the plugin's configuration file.
   */
  configPath?: string;

  /**
   * An optional path to an image to use as the icon for the plugin.
   */
  imagePath?: string;

  /**
   * A list of plugin providers that this plugin depends on.
   */
  dependencies: string[];

  /**
   * A set of optional tags that describe the plugin.
   */
  tags: string[];

  /**
   * The options to pass to the plugin module when instantiating
   */
  options: any;

  /**
   * The path to the plugin's module loader.
   */
  loader: string;
}

/**
 * A function that can be used to hook into the plugin system.
 */
export type PluginHookFn<TContext = any> = (
  params: TContext
) => MaybePromise<TContext | ((params: TContext) => MaybePromise<TContext>)>;

/**
 * A plugin module that can be loaded by the plugin system.
 */
export interface IPluginModule<TContext = any> {
  hooks?: Record<any, PluginHookFn<TContext>>;
}

/**
 * A plugin loader that can be used to load a plugin module.
 */
export interface IPluginLoader<
  TContext = any,
  TPluginModule extends IPluginModule<TContext> = any
> {
  load: (
    definition: PluginDefinition,
    options: Record<string, any>
  ) => Promise<PluginInstance<TContext, TPluginModule>>;
  isValid: (module: TPluginModule) => boolean;
  execute: (
    instance: PluginInstance,
    context: TContext,
    options: Record<string, any>
  ) => Promise<void>;
}

/**
 * An instance of a plugin that has been loaded by the plugin system.
 */
export interface PluginInstance<
  TContext = any,
  TPluginModule extends IPluginModule<TContext> = any
> {
  loader: IPluginLoader<TContext, TPluginModule>;
  definition: PluginDefinition;
  module: TPluginModule;
  options: any;
  executionDateTime: StormDateTime;
}

/**
 * A plugin manager that can be used to manage plugins.
 */
export interface IPluginManager<
  TContext = any,
  TPluginModule extends IPluginModule<TContext> = any
> {
  /**
   * Finds all the plugins based on the configuration options.
   *
   * @returns The list of definitions for the plugins in the system.
   */
  discover(): Promise<Set<PluginDefinition>>;

  /**
   * Finds the plugin and does a dynamic require to whatever the plugin exports.
   *
   * @param provider - The identifier of the plugin
   * @param options - Run-time options to configure your exports.
   * @returns An object containing the exported functionality.
   */
  instantiate(
    provider: string,
    options?: Record<string, any>
  ): Promise<PluginInstance>;

  /**
   * Registers a plugin definition in the manager.
   *
   * This method is used to manually register a plugin at run-time. Uses for
   * this are dynamic plugins.
   *
   * @param provider - The plugin provider path/package name that provides this plugin.
   * @returns `true` if the definition was registered. `false` if there was an error.
   */
  register(provider: string): boolean;
}
