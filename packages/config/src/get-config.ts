import { Schema, wrap } from "@decs/typeschema";
import { deepMerge } from "@storm-software/utilities/helper-fns/deep-merge";
import { camelCase, constantCase } from "@storm-software/utilities/string-fns";
import { isSetString } from "@storm-software/utilities/type-checks";
import { StormConfig, wrapped_StormConfig } from "./types";

const _module_cache = new WeakMap<{ moduleName: string }, any>();
let _static_cache: StormConfig | undefined = undefined;

const getConfigModuleEnv = <
  TConfig extends Record<string, any> = Record<string, any>
>(
  config: Partial<StormConfig>,
  moduleName: string
): TConfig | undefined => {
  const prefix = `STORM_MODULE_${constantCase(moduleName)}_`;
  return Object.keys(process.env)
    .filter(key => key.startsWith(prefix))
    .reduce(
      (ret: Record<string, any>, key: string) => {
        const name = camelCase(key.replace(prefix, ""));
        isSetString(name) && (ret[name] = process.env[key]);

        return ret;
      },
      config.modules?.[moduleName] ?? {}
    ) as TConfig;
};

const getPackageConfigEnv = (config: Partial<StormConfig>): StormConfig => {
  const prefix = `STORM_`;
  let packageConfig: StormConfig = {
    name: process.env[`${prefix}NAME`] ?? config.name,
    namespace: process.env[`${prefix}NAMESPACE`] ?? config.namespace,
    owner: process.env[`${prefix}OWNER`] ?? config.owner,
    worker: process.env[`${prefix}WORKER`] ?? config.worker,
    organization: process.env[`${prefix}ORGANIZATION`] ?? config.organization,
    license: process.env[`${prefix}LICENSE`] ?? config.license,
    homepage: process.env[`${prefix}HOMEPAGE`] ?? config.homepage,
    timezone: process.env[`${prefix}TIMEZONE`] ?? config.timezone,
    locale: process.env[`${prefix}LOCALE`] ?? config.locale,
    configFile: process.env[`${prefix}CONFIG_FILE`] ?? config.configFile,
    runtimeVersion:
      process.env[`${prefix}RUNTIME_VERSION`] ?? config.runtimeVersion,
    runtimeDirectory:
      process.env[`${prefix}RUNTIME_DIRECTORY`] ?? config.runtimeDirectory,
    env: process.env[`${prefix}ENV`] ?? process.env.NODE_ENV ?? config.env,
    colors: {
      primary: process.env[`${prefix}COLORS_PRIMARY`] ?? config.colors?.primary,
      background:
        process.env[`${prefix}COLORS_BACKGROUND`] ?? config.colors?.background,
      success: process.env[`${prefix}COLORS_SUCCESS`] ?? config.colors?.success,
      info: process.env[`${prefix}COLORS_INFO`] ?? config.colors?.info,
      warning: process.env[`${prefix}COLORS_WARNING`] ?? config.colors?.warning,
      error: process.env[`${prefix}COLORS_ERROR`] ?? config.colors?.error,
      fatal: process.env[`${prefix}COLORS_FATAL`] ?? config.colors?.fatal
    },
    repository: process.env[`${prefix}REPOSITORY`] ?? config.repository,
    branch: process.env[`${prefix}BRANCH`] ?? config.branch,
    preMajor: process.env[`${prefix}PRE_MAJOR`] ?? config.preMajor,
    modules: config.modules ?? {}
  };

  const serializedConfig = process.env[`${prefix}CONFIG`];
  if (serializedConfig) {
    packageConfig = deepMerge(packageConfig, JSON.parse(serializedConfig));
  }

  const modulePrefix = `${prefix}MODULE_`;
  return Object.keys(process.env)
    .filter(key => key.startsWith(modulePrefix))
    .reduce((ret: Record<string, any>, key: string) => {
      const module = camelCase(
        key.substring(prefix.length, key.indexOf("_", prefix.length))
      );
      isSetString(module) &&
        (ret.modules[module] = getConfigModuleEnv(config, module));

      return ret;
    }, packageConfig);
};

/**
 * Get the static config for the current Storm workspace
 *
 * @returns The static config for the current Storm workspace
 */
export const getStormConfig = async <
  TModuleName extends string = string,
  TModuleConfig = any
>(
  schema?: Schema,
  moduleName?: TModuleName
): Promise<StormConfig<TModuleName, TModuleConfig>> => {
  let result!: StormConfig<TModuleName, TModuleConfig>;
  if (!_static_cache) {
    let config = getPackageConfigEnv({}) as Record<string, any> & {
      [moduleName in TModuleName]: TModuleConfig;
    };
    result = await wrapped_StormConfig.parse(config);
  } else {
    result = _static_cache as StormConfig<TModuleName, TModuleConfig>;
  }

  if (schema && moduleName) {
    const moduleConfig = await getConfigModule(schema, moduleName);
    result.modules[moduleName] = moduleConfig;
  }

  _static_cache = result;
  return result;
};

/**
 * Get the config for a specific Storm config module
 *
 * @param moduleName - The name of the config module
 * @param options - The options for the config module
 * @returns The config for the specified Storm config module. If the module does not exist, `undefined` is returned.
 */
export const getConfigModule = async <TModuleConfig = any>(
  schema: Schema,
  moduleName: string
): Promise<TModuleConfig> => {
  const module_cache_key = { moduleName };
  if (_module_cache.has(module_cache_key)) {
    return _module_cache.get(module_cache_key) as TModuleConfig;
  }

  let result = await getStormConfig();

  let module = result?.modules?.[moduleName];
  if (schema) {
    const wrapped = wrap(schema);
    module = (await wrapped.parse(module)) as TModuleConfig;
  }

  _module_cache.set(module_cache_key, module);
  return module;
};
