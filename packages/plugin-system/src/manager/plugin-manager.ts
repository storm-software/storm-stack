import { readFile } from "node:fs/promises";
import { StormDateTime } from "@storm-stack/date-time";
import { StormError } from "@storm-stack/errors";
import { exists, findContainingFolder, findFilePath, joinPaths } from "@storm-stack/file-system";
import type { IStormLog } from "@storm-stack/logging";
import { StormParser } from "@storm-stack/serialization";
import {
  EMPTY_STRING,
  type MaybePromise,
  deepMerge,
  isFunction,
  isSet,
  isSetObject,
  kebabCase,
  titleCase
} from "@storm-stack/utilities";
import { glob } from "glob";
import md5 from "md5";
import toposort from "toposort";
import { PluginSystemErrorCode } from "../errors";
import {
  type IPluginLoader,
  type IPluginModule,
  type PluginDefinition,
  PluginDiscoveryMode,
  type PluginHookFn,
  type PluginInstance,
  type PluginManagerOptions
} from "../types";
import { createResolver } from "../utilities/create-resolver";

const PLUGIN_CONFIG_JSON = "plugin.json";

/**
 * Discovers and instantiates plugins.
 */
export class PluginManager<TContext = any, TPluginModule extends IPluginModule = any> {
  private _options: PluginManagerOptions;
  private _hasDiscovered = false;

  private _registry: Map<string, PluginDefinition>;
  private _store: Map<string, PluginInstance<TContext, TPluginModule>>;
  private _hooks: Map<string, PluginHookFn<TContext>[]>;
  private _logger: IStormLog;

  private _loaders: Map<string, IPluginLoader<TContext, TPluginModule>>;
  private _loaderResolver: (request: string) => Promise<string>;

  public static create = async <
    TContext = any,
    TPluginModule extends IPluginModule<TContext> = any
  >(
    logger: IStormLog,
    options: Omit<Partial<PluginManagerOptions>, "defaultLoader"> &
      Pick<PluginManagerOptions, "defaultLoader">
  ): Promise<PluginManager<TContext, TPluginModule>> => {
    const pluginManager = new PluginManager<TContext, TPluginModule>(logger, options);

    await pluginManager._getLoader(pluginManager._options.defaultLoader);
    if (pluginManager._options.discoveryMode === PluginDiscoveryMode.AUTO) {
      await pluginManager.discover();
    }

    return pluginManager;
  };

  /**
   * Creates a new plugin manager object.
   *
   * @param config - The base storm workspace configuration.
   * @param options - The plugin configuration options.
   */
  private constructor(
    logger: IStormLog,
    options: Omit<Partial<PluginManagerOptions>, "defaultLoader"> &
      Pick<PluginManagerOptions, "defaultLoader">
  ) {
    const defaults: Partial<PluginManagerOptions> = {
      rootPath: process.env.STORM_WORKSPACE_ROOT || process.cwd() || ".",
      useNodeModules: true,
      autoInstall: true,
      discoveryMode: PluginDiscoveryMode.FALLBACK
    };
    this._options = deepMerge(defaults, options);

    if (!this._options.tsconfig || !exists(this._options.tsconfig)) {
      this._options.tsconfig = joinPaths(this._options.rootPath, "tsconfig.json");
      if (!exists(this._options.tsconfig)) {
        this._options.tsconfig = joinPaths(this._options.rootPath, "tsconfig.base.json");
      }
    }

    this._logger = logger;
    this._registry = new Map<string, PluginDefinition>();
    this._store = new Map<string, PluginInstance<TContext, TPluginModule>>();
    this._hooks = new Map<string, PluginHookFn<TContext>[]>();
    this._loaders = new Map<string, IPluginLoader<TContext, TPluginModule>>();
    this._loaderResolver = createResolver(
      options.rootPath,
      this._options.tsconfig,
      this._options.autoInstall
    );
  }

  public discover = async (): Promise<Map<string, PluginDefinition>> => {
    if (this._hasDiscovered) {
      return Promise.resolve(this._registry);
    }

    const fileGlob = this._globExpression();
    this._logger.info(`Discovering plugins using glob ${fileGlob}`);

    const paths = await glob(fileGlob);
    await Promise.all(paths.map(this.register) ?? []);

    this._hasDiscovered = true;
    return this._registry;
  };

  public getInstance = (
    provider: string,
    options: Record<string, any> = {}
  ): PluginInstance<TContext, TPluginModule> | undefined => {
    return this._store.get(this._getCacheId(provider, options));
  };

  public instantiate = async (
    provider: string,
    options: Record<string, any> = {}
  ): Promise<PluginInstance<TContext, TPluginModule>> => {
    let instance = this.getInstance(provider, options);
    if (instance) {
      return Promise.resolve(instance);
    }

    const definition: PluginDefinition = await this.register(provider);
    const loader = await this._getLoader(definition.loader ?? this._options.defaultLoader);

    instance = await loader.load(definition, options);
    if (!isSetObject(instance)) {
      throw new StormError(PluginSystemErrorCode.plugin_loading_failure, {
        message: `The plugin "${provider}" did not return an object after loading.`
      });
    }

    this._store.set(this._getCacheId(instance.definition.provider, options), instance);

    await Promise.all(
      instance.definition.dependencies.map((dependency) => this.instantiate(dependency, options))
    );

    return instance;
  };

  public execute = async (
    provider: string,
    context: TContext,
    options: Record<string, any> = {},
    executionDateTime: StormDateTime = StormDateTime.current()
  ): Promise<Record<string, Error | null>> => {
    const instance = await this.instantiate(provider, options);
    if (!instance) {
      return {
        [provider]: new StormError(PluginSystemErrorCode.plugin_loading_failure, {
          message: `The plugin "${provider}" could not be loaded prior to execution.`
        })
      };
    }

    instance.executionDateTime = executionDateTime;
    this._store.set(this._getCacheId(provider, options), instance);

    const dependenciesResults = await Promise.all(
      instance.definition.dependencies.map((dependency) =>
        this.execute(dependency, context, options, executionDateTime)
      )
    );

    const result = dependenciesResults.reduce(
      (ret: Record<string, Error | null>, dependenciesResult: Record<string, Error | null>) => {
        for (const key of Object.keys(dependenciesResult)) {
          if (!ret[key]) {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            ret[key] = dependenciesResult[key]!;
          }
        }

        return ret;
      },
      {}
    );

    try {
      instance.loader.process(context, instance, options);
    } catch (e) {
      result[provider] = StormError.create(e);
    }

    return result;
  };

  public invokeHook = async (
    name: string,
    context: TContext,
    handler?: (context: TContext) => Promise<TContext> | TContext
  ): Promise<TContext> => {
    let listeners = [] as PluginHookFn<TContext>[];
    if (this._hooks.has(name)) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      listeners = this._hooks.get(name)!;
    } else {
      const hooks = [] as Array<{
        provider: string;
        listener: PluginHookFn<TContext>;
        dependencies: string[];
      }>;
      for (const [provider, value] of this._store.entries()) {
        if (value.module.hooks?.[name]) {
          const plugin = this._store.get(provider);

          hooks.push({
            provider,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            listener: value.module.hooks?.[name]!,
            dependencies: plugin?.definition?.dependencies ?? []
          });
        }
      }

      const edges = hooks.reduce(
        (
          ret: [string, string][],
          hook: {
            provider: string;
            listener: PluginHookFn<TContext>;
            dependencies: string[];
          }
        ) => {
          hook.dependencies
            .filter((dependency) => hooks.some((depHook) => depHook.provider === dependency))
            .map((dependency) => ret.push([hook.provider, dependency]));

          return ret;
        },
        []
      );

      listeners = toposort
        .array(
          hooks.map((hook) => hook.provider),
          edges
        )
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        .map((hook: string) => hooks.find((h) => h.provider === hook)?.listener!);
    }

    let nextContext = context;
    const callbacks = [] as ((context: TContext) => MaybePromise<TContext>)[];
    for (const listener of listeners) {
      const result: TContext | ((params: TContext) => MaybePromise<TContext>) =
        await Promise.resolve(listener(nextContext));
      if (isFunction(result)) {
        callbacks.push(result as (params: TContext) => MaybePromise<TContext>);
      } else {
        nextContext = (result ?? nextContext) as TContext;
      }
    }

    if (handler) {
      nextContext = await Promise.resolve(handler(nextContext));
    }

    for (const callback of callbacks) {
      nextContext = await Promise.resolve(callback(nextContext));
    }

    return nextContext;
  };

  public register = async (provider: string): Promise<PluginDefinition> => {
    let definition = this._registry.get(provider);
    if (definition) {
      return definition;
    }

    definition = await this._getDefinition(provider);
    if (
      !definition &&
      (this._options.discoveryMode === PluginDiscoveryMode.AUTO ||
        this._options.discoveryMode === PluginDiscoveryMode.FALLBACK)
    ) {
      await this.discover();
      if (this._registry.has(provider)) {
        definition = this._registry.get(provider);
      }
    }

    if (!definition) {
      throw new StormError(PluginSystemErrorCode.plugin_not_found, {
        message: `Could not find plugin provider ${provider}. \nDiscovered plugins: ${Object.keys(
          this._registry
        )
          .map((key) => {
            const found = this._registry.get(key);

            return `${found?.name} v${found?.version} - ${found?.configPath}`;
          })
          .join("\n")}`
      });
    }

    this._registry.set(provider, definition);
    await Promise.all(definition.dependencies.map(this.register));

    return definition;
  };

  public getRegistry(): Map<string, PluginDefinition> {
    return this._registry;
  }

  public getLoaders(): Map<string, IPluginLoader<TContext, TPluginModule>> {
    return this._loaders;
  }

  public getStore(): Map<string, PluginInstance<TContext, TPluginModule>> {
    return this._store;
  }

  /**
   * Generates a cache ID for the plugin and the config.
   *
   * @param provider - The plugin provider.
   * @param options - The options for the plugin.
   * @returns The cache ID.
   */
  private _getCacheId(provider: string, options: any): string {
    return md5(`${provider}::${StormParser.stringify(options)}`);
  }

  /**
   * Builds the globbing expression based on the configuration options.
   *
   * @returns The globbing expression.
   */
  private _globExpression(): string {
    return this._options.useNodeModules
      ? `${this._options.rootPath}/**/${PLUGIN_CONFIG_JSON}`
      : `${this._options.rootPath}/!(node_modules)/**/${PLUGIN_CONFIG_JSON}`;
  }

  /**
   * Gets the loader module.
   *
   * @param loader - The loader module to retrieve.
   * @returns The loader module.
   */
  private _getLoader = async (loader: string): Promise<IPluginLoader<TContext, TPluginModule>> => {
    if (this._loaders.has(loader)) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      return this._loaders.get(loader)!;
    }

    let module!: IPluginLoader<TContext, TPluginModule>;
    try {
      const resolved = await this._loaderResolver(loader);
      if (!resolved) {
        throw new StormError(PluginSystemErrorCode.module_not_found, {
          message: `Cannot find plugin loader ${loader}`
        });
      }

      module = await import(resolved);
    } catch (origError) {
      this._logger.error(`Unable to initialize loader module ${loader}: ${origError}`);

      throw new StormError(PluginSystemErrorCode.module_not_found, {
        message: isSet(origError) ? `Error: ${StormParser.stringify(origError)}` : undefined
      });
    }

    if (!module) {
      this._logger.error(`Plugin provider ${loader} cannot be found`);

      throw new StormError(PluginSystemErrorCode.module_not_found, {
        message: `Plugin provider ${loader} cannot be found`
      });
    }

    this._loaders.set(loader, module);
    return module;
  };

  /**
   * Gets the plugin definition from the plugin configuration file.
   *
   * @param _configPath - The path to the plugin configuration file.
   * @returns The plugin definition.
   */
  private _getDefinition = async (_configPath: string): Promise<PluginDefinition | undefined> => {
    let configPath = _configPath;
    let packagePath!: string;
    if (configPath.includes(PLUGIN_CONFIG_JSON)) {
      packagePath = findFilePath(configPath);
    } else {
      configPath = joinPaths(configPath, PLUGIN_CONFIG_JSON);
      packagePath = configPath;
    }

    if (!exists(configPath)) {
      return undefined;
    }

    const fileContent = await readFile(configPath);
    const configJson = JSON.parse(fileContent.toString());

    let id = configJson?.id;
    let name = configJson?.name;
    let description = configJson?.description;
    let provider = configJson?.provider;
    let version = configJson?.version;
    let dependencies = configJson?.dependencies ?? [];
    const imagePath = configJson?.imagePath;
    const options = configJson?.options ?? {};
    const tags = configJson?.tags ?? [];

    if (exists(joinPaths(configPath, "package.json"))) {
      const packageContent = await readFile(joinPaths(configPath, "package.json"));
      const packageJson = JSON.parse(packageContent.toString());
      if (packageJson.peerDependencies) {
        dependencies = Object.keys(packageJson.peerDependencies).reduce(
          (ret: string[], key: string) => {
            if (!ret.includes(key)) {
              ret.push(key);
            }

            return ret;
          },
          dependencies
        );
      }

      id ??= packageJson.name
        .trim()
        .replaceAll("@", EMPTY_STRING)
        .replaceAll("/", "-")
        .replaceAll("\\", "-")
        .replaceAll(" ", "-");
      provider ??= packageJson.name;
      name ??= titleCase(packageJson.name);
      version ??= packageJson.version;
      description ??= packageJson.description;
    }

    name ??= findContainingFolder(provider);

    return {
      id:
        id ??
        kebabCase(
          name
            .trim()
            .replaceAll("@", EMPTY_STRING)
            .replaceAll("/", "-")
            .replaceAll("\\", "-")
            .replaceAll(" ", "-")
        ),
      provider: provider ?? packagePath ?? configPath,
      name,
      version: version ?? "0.0.0",
      description,
      dependencies,
      packagePath,
      configPath,
      imagePath,
      options,
      tags,
      loader: configJson.loader ?? this._options.defaultLoader
    };
  };
}
