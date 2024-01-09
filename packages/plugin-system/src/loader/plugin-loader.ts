import { StormError } from "@storm-stack/errors";
import { PluginSystemErrorCode } from "../errors";
import type {
  IPluginLoader,
  IPluginModule,
  PluginDefinition,
  PluginInstance
} from "../types";

/**
 *   A base class to detect properly loaded plugins.
 */
export abstract class PluginLoader<
  TContext = any,
  TPluginModule extends IPluginModule<TContext> = any
> implements IPluginLoader<TContext, TPluginModule>
{
  public abstract execute: (
    instance: PluginInstance<TContext, TPluginModule>,
    context: TContext,
    options: Record<string, any>
  ) => Promise<void>;

  public load = async (
    definition: PluginDefinition
  ): Promise<TPluginModule> => {
    const module = await import(definition.provider);
    if (!this.isValid(module)) {
      throw new StormError(PluginSystemErrorCode.plugin_loading_failure, {
        message: `The plugin module "${definition.provider}" does not contain the required exports.`
      });
    }

    return module;
  };

  public isValid = (module: TPluginModule): boolean => {
    if (!module) {
      return false;
    }

    return true;
  };
}
