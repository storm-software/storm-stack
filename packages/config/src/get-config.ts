import { Schema, wrap } from "@decs/typeschema";
import { StormConfig, wrapped_StormConfig } from "./types";
import { getDefaultConfig } from "./utilities/default-config";

const _module_cache = new WeakMap<{ moduleName: string }, any>();
let _static_cache: StormConfig | undefined = undefined;

const getConfigModuleEnv = <
  TConfig extends Record<string, any> = Record<string, any>
>(
  config: Partial<StormConfig>,
  moduleName: string
): TConfig | undefined => {
  const prefix = `STORM_MODULE_${moduleName.toUpperCase()}_`;
  return Object.keys(process.env)
    .filter(key => key.startsWith(prefix))
    .reduce(
      (ret: Record<string, any>, key: string) => {
        const name = key
          .replace(prefix, "")
          .split("_")
          .map(i =>
            i.length > 0
              ? i.trim().charAt(0).toUpperCase() + i.trim().slice(1)
              : ""
          )
          .join("");
        name && (ret[name] = process.env[key]);

        return ret;
      },
      config.modules?.[moduleName] ?? {}
    ) as TConfig;
};

const getPackageConfigEnv = (config: Partial<StormConfig>): StormConfig => {
  const defaultConfig = getDefaultConfig();

  const prefix = `STORM_`;
  let packageConfig: StormConfig = {
    ...defaultConfig,
    name: process.env[`${prefix}NAME`] ?? config.name ?? defaultConfig.name,
    namespace:
      process.env[`${prefix}NAMESPACE`] ??
      config.namespace ??
      defaultConfig.namespace,
    owner: process.env[`${prefix}OWNER`] ?? config.owner ?? defaultConfig.owner,
    worker:
      process.env[`${prefix}WORKER`] ?? config.worker ?? defaultConfig.worker,
    organization:
      process.env[`${prefix}ORGANIZATION`] ??
      config.organization ??
      defaultConfig.organization,
    license:
      process.env[`${prefix}LICENSE`] ??
      config.license ??
      defaultConfig.license,
    homepage:
      process.env[`${prefix}HOMEPAGE`] ??
      config.homepage ??
      defaultConfig.homepage,
    timezone:
      process.env[`${prefix}TIMEZONE`] ??
      config.timezone ??
      defaultConfig.timezone,
    locale:
      process.env[`${prefix}LOCALE`] ?? config.locale ?? defaultConfig.locale,
    configFile:
      process.env[`${prefix}CONFIG_FILE`] ??
      config.configFile ??
      defaultConfig.configFile,
    runtimeVersion:
      process.env[`${prefix}RUNTIME_VERSION`] ??
      config.runtimeVersion ??
      defaultConfig.runtimeVersion,
    runtimeDirectory:
      process.env[`${prefix}RUNTIME_DIRECTORY`] ??
      config.runtimeDirectory ??
      defaultConfig.runtimeDirectory,
    env: (process.env[`${prefix}ENV`] ??
      process.env.NODE_ENV ??
      config.env ??
      defaultConfig.env) as "development" | "staging" | "production",
    colors: {
      primary:
        process.env[`${prefix}COLORS_PRIMARY`] ??
        config.colors?.primary ??
        defaultConfig.colors.primary,
      background:
        process.env[`${prefix}COLORS_BACKGROUND`] ??
        config.colors?.background ??
        defaultConfig.colors.background,
      success:
        process.env[`${prefix}COLORS_SUCCESS`] ??
        config.colors?.success ??
        defaultConfig.colors.success,
      info:
        process.env[`${prefix}COLORS_INFO`] ??
        config.colors?.info ??
        defaultConfig.colors.info,
      warning:
        process.env[`${prefix}COLORS_WARNING`] ??
        config.colors?.warning ??
        defaultConfig.colors.warning,
      error:
        process.env[`${prefix}COLORS_ERROR`] ??
        config.colors?.error ??
        defaultConfig.colors.error,
      fatal:
        process.env[`${prefix}COLORS_FATAL`] ??
        config.colors?.fatal ??
        defaultConfig.colors.fatal
    },
    repository:
      process.env[`${prefix}REPOSITORY`] ??
      config.repository ??
      defaultConfig.repository,
    branch:
      process.env[`${prefix}BRANCH`] ?? config.branch ?? defaultConfig.branch,
    preMajor:
      Boolean(process.env[`${prefix}PRE_MAJOR`]) ??
      config.preMajor ??
      defaultConfig.preMajor,
    modules: config.modules ?? {}
  };

  const serializedConfig = process.env[`${prefix}CONFIG`];
  if (serializedConfig) {
    packageConfig = Object.assign(packageConfig, JSON.parse(serializedConfig));
  }

  const modulePrefix = `${prefix}MODULE_`;
  return Object.keys(process.env)
    .filter(key => key.startsWith(modulePrefix))
    .reduce((ret: StormConfig, key: string) => {
      const module = key
        .substring(prefix.length, key.indexOf("_", prefix.length))
        .split("_")
        .map(i =>
          i.length > 0
            ? i.trim().charAt(0).toUpperCase() + i.trim().slice(1)
            : ""
        )
        .join("");
      module && (ret.modules[module] = getConfigModuleEnv(config, module));

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
    let config = getPackageConfigEnv({}) as StormConfig & {
      [moduleName in TModuleName]: TModuleConfig;
    };
    result = (await wrapped_StormConfig.parse(config)) as StormConfig<
      TModuleName,
      TModuleConfig
    >;
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
