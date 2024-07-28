import { StormDateTime } from "@storm-stack/date-time";
import { StormError } from "@storm-stack/errors";
import { PluginSystemErrorCode } from "../errors";
import type {
  IPluginLoader,
  IPluginModule,
  PluginDefinition,
  PluginInstance
} from "../types";
import { createResolver } from "../utilities/create-resolver";

/**
 *   A base class to detect properly loaded plugins.
 */
export abstract class PluginLoader<
  TContext = any,
  TPluginModule extends IPluginModule<TContext> = IPluginModule<TContext>
> implements IPluginLoader<TContext, TPluginModule>
{
  protected resolver: (request: string) => Promise<string>;

  public constructor(
    public readonly rootPath?: string,
    public readonly tsconfig?: string,
    public readonly autoInstall?: boolean
  ) {
    this.resolver = createResolver(tsconfig);
  }

  public abstract process: (
    context: TContext,
    instance: PluginInstance<TContext, TPluginModule>,
    options: Record<string, any>
  ) => Promise<void>;

  public load = async (
    definition: PluginDefinition,
    options: Record<string, any> = {}
  ): Promise<PluginInstance<TContext, TPluginModule>> => {
    const module = await this.resolve(definition, options);
    if (!this.isValid(module)) {
      throw new StormError(PluginSystemErrorCode.plugin_loading_failure, {
        message: `The plugin module "${definition.provider}" does not contain the required exports.`
      });
    }

    return this.instantiate(definition, module, definition.provider, options);
  };

  // eslint-disable-next-line class-methods-use-this
  public isValid = (module: TPluginModule): boolean => {
    if (!module) {
      return false;
    }

    return true;
  };

  protected instantiate = (
    definition: PluginDefinition,
    module: TPluginModule,
    resolvedPath: string,
    options: Record<string, any> = {}
  ): PluginInstance<TContext, TPluginModule> => {
    const instance = {
      loader: this,
      definition,
      module,
      options,
      resolvedPath,
      executionDateTime: StormDateTime.minimum()
    };

    return instance;
  };

  protected resolve = async (
    definition: PluginDefinition,
    _: Record<string, any> = {}
  ) => {
    const resolved = await this.resolver(definition.provider);
    if (!resolved) {
      throw new StormError(PluginSystemErrorCode.plugin_loading_failure, {
        message: `Cannot find plugin ${definition.provider}`
      });
    }

    return await import(resolved);
  };
}
