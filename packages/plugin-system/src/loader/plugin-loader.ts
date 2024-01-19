import { StormDateTime } from "@storm-stack/date-time";
import { StormError } from "@storm-stack/errors";
import { PluginSystemErrorCode } from "../errors";
import type {
	IPluginLoader,
	IPluginModule,
	PluginDefinition,
	PluginInstance,
} from "../types";
import { ResolverFactory } from "oxc-resolver";
import { createResolver } from "../utilities/create-resolver";
import {
	findFileName,
	findFilePath,
	isDirectory,
	isFile,
} from "@storm-stack/file-system";

/**
 *   A base class to detect properly loaded plugins.
 */
export abstract class PluginLoader<
	TContext = any,
	TPluginModule extends IPluginModule<TContext> = IPluginModule<TContext>,
> implements IPluginLoader<TContext, TPluginModule>
{
	protected resolver: ResolverFactory;

	public constructor(public readonly tsconfig: string) {
		this.resolver = createResolver(tsconfig);
	}

	public abstract execute: (
		instance: PluginInstance<TContext, TPluginModule>,
		context: TContext,
		options: Record<string, any>,
	) => Promise<void>;

	public load = async (
		definition: PluginDefinition,
		options: Record<string, any> = {},
	): Promise<PluginInstance<TContext, TPluginModule>> => {
		const module = await this.resolve(definition, options);
		if (!this.isValid(module)) {
			throw new StormError(PluginSystemErrorCode.plugin_loading_failure, {
				message: `The plugin module "${definition.provider}" does not contain the required exports.`,
			});
		}

		return this.instantiate(definition, module, definition.provider, options);
	};

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
		options: Record<string, any> = {},
	): PluginInstance<TContext, TPluginModule> => {
		const instance = {
			loader: this,
			definition,
			module,
			options,
			resolvedPath,
			executionDateTime: StormDateTime.minimum(),
		};

		return instance;
	};

	protected resolve = async (
		definition: PluginDefinition,
		options: Record<string, any> = {},
	) => {
		const resolved = this.resolver.sync(
			isDirectory(definition.provider)
				? definition.provider
				: findFilePath(definition.provider),
			isFile(definition.provider)
				? findFileName(definition.provider)
				: "./index.js",
		);
		if (resolved.error || !resolved.path) {
			throw new StormError(PluginSystemErrorCode.plugin_loading_failure, {
				message: resolved.error,
			});
		}

		return await import(resolved.path);
	};
}
