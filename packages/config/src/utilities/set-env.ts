import { stringify } from "@storm-software/serialization/json-parser";
import { flattenObject } from "@storm-software/utilities/helper-fns/flatten-object";
import { constantCase } from "@storm-software/utilities/string-fns/constant-case";
import { DeepPartial } from "@storm-software/utilities/types";
import { loadStormConfig } from "../load-config";
import { StormConfig } from "../types";

/**
 * Sets the environment variables for the current process.
 *
 * @param defaultConfig - The default configuration to use if none is found.
 * @returns The loaded configuration.
 */
export const setEnv = async <TConfig extends StormConfig = StormConfig>(
  projectName?: string,
  defaultConfig?: DeepPartial<TConfig>
): Promise<TConfig> => {
  const config = await loadStormConfig<TConfig>(projectName, defaultConfig);

  const env = flattenObject(config, "STORM", constantCase);
  process.env.STORM_CONFIG ??= stringify(config);

  for (const key of Object.keys(env)) {
    process.env[key] ??= env[key];
  }

  // Handle extra env variables
  process.env.NODE_ENV ??= process.env.STORM_ENV;
  process.env.MODE ??= process.env.STORM_ENV;
  process.env.ENV ??= process.env.STORM_ENV;
  process.env.ENVIRONMENT ??= process.env.STORM_ENV;
  process.env.CI ??= process.env.STORM_CI;
  process.env.CONTINUOUS_INTEGRATION ??= process.env.STORM_CI;
  process.env.TZ ??= process.env.STORM_TIMEZONE;
  process.env.TIMEZONE ??= process.env.STORM_TIMEZONE;
  process.env.LOCALE ??= process.env.STORM_LOCALE;

  return config;
};
