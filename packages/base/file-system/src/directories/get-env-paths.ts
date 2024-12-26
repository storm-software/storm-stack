/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

import { isString } from "@storm-stack/types/type-checks/is-string";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { findFilePath } from "../files/file-path-fns";
import { joinPaths } from "../files/join-paths";

// Forked from https://www.npmjs.com/package/env-paths

const homedir = os.homedir();
const tmpdir = os.tmpdir();
const { env } = process;

/**
 * Options for the `getEnvPaths` function.
 */
export type GetEnvPathsOptions = {
  /**
   * The name of the organization
   *
   * @defaultValue "storm-software"
   */
  orgId?: string;

  /**
   * The name of the specific application to use as a nested folder inside the organization's folder
   *
   * For example: `~/.../storm-software/Log/<appId>`
   */
  appId?: string;

  /**
   * The suffix to append to the project name.
   *
   * @remarks
   * If `suffix` is `true`, the project name will be suffixed with `"nodejs"`.
   *
   * @defaultValue false
   */
  suffix?: string | boolean | null;
};

export type EnvPaths = {
  data: string;
  config: string;
  cache: string;
  log: string;
  temp: string;
};

const macos = (orgId: string): EnvPaths => {
  const library = joinPaths(homedir, "Library");

  return {
    data: joinPaths(library, "Application Support", orgId),
    config: joinPaths(library, "Preferences", orgId),
    cache: joinPaths(library, "Caches", orgId),
    log: joinPaths(library, "Logs", orgId),
    temp: joinPaths(tmpdir, orgId)
  };
};

const windows = (orgId: string): EnvPaths => {
  const appData = env.APPDATA || joinPaths(homedir, "AppData", "Roaming");
  const localAppData =
    env.LOCALAPPDATA || joinPaths(homedir, "AppData", "Local");

  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: joinPaths(localAppData, orgId, "Data"),
    config: joinPaths(appData, orgId, "Config"),
    cache: joinPaths(localAppData, orgId, "Cache"),
    log: joinPaths(localAppData, orgId, "Log"),
    temp: joinPaths(tmpdir, orgId)
  };
};

// https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
const linux = (orgId: string): EnvPaths => {
  const username = path.basename(homedir);

  return {
    data: joinPaths(
      env.XDG_DATA_HOME || joinPaths(homedir, ".local", "share"),
      orgId
    ),
    config: joinPaths(
      env.XDG_CONFIG_HOME || joinPaths(homedir, ".config"),
      orgId
    ),
    cache: joinPaths(env.XDG_CACHE_HOME || joinPaths(homedir, ".cache"), orgId),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: joinPaths(
      env.XDG_STATE_HOME || joinPaths(homedir, ".local", "state"),
      orgId
    ),
    temp: joinPaths(tmpdir, username, orgId)
  };
};

/**
 * Get paths for storing things like data, config, logs, and cache in the current runtime environment.
 *
 * @remarks
 * On macOS, directories are generally created in `~/Library/Application Support/<name>`.
 * On Windows, directories are generally created in `%AppData%/<name>`.
 * On Linux, directories are generally created in `~/.config/<name>` - this is determined via the [XDG Base Directory spec](https://specifications.freedesktop.org/basedir-spec/latest/).
 *
 * If the `STORM_DATA_DIRECTORY`, `STORM_CONFIG_DIRECTORY`, `STORM_CACHE_DIRECTORY`, `STORM_LOG_DIRECTORY`, or `STORM_TEMP_DIRECTORY` environment variables are set, they will be used instead of the default paths.
 *
 * @param options - Parameters used to determine the specific paths for the current project/runtime environment
 * @returns An object containing the various paths for the runtime environment
 */
export function getEnvPaths(options?: GetEnvPathsOptions): EnvPaths {
  let orgId = options?.orgId || "storm-software";
  if (!orgId) {
    throw new Error(
      "You need to provide an orgId to the `getEnvPaths` function"
    );
  }

  if (options?.suffix) {
    // Add suffix to prevent possible conflict with native apps
    orgId += `-${isString(options.suffix) ? options?.suffix : "nodejs"}`;
  }

  let result = {} as Record<string, string>;
  if (process.platform === "darwin") {
    result = macos(orgId);
  } else if (process.platform === "win32") {
    result = windows(orgId);
  } else {
    result = linux(orgId);
  }

  if (process.env.STORM_DATA_DIRECTORY) {
    result.data = process.env.STORM_DATA_DIRECTORY;
  } else if (process.env.STORM_CONFIG_DIRECTORY) {
    result.config = process.env.STORM_CONFIG_DIRECTORY;
  } else if (process.env.STORM_CACHE_DIRECTORY) {
    result.cache = process.env.STORM_CACHE_DIRECTORY;
  } else if (
    process.env.STORM_LOG_DIRECTORY ||
    process.env.STORM_LOG_PATH ||
    process.env.STORM_EXTENSIONS_TELEMETRY_PATH
  ) {
    result.log = (process.env.STORM_LOG_DIRECTORY ||
      process.env.STORM_LOG_PATH ||
      process.env.STORM_EXTENSIONS_TELEMETRY_PATH)!;
  } else if (process.env.STORM_TEMP_DIRECTORY) {
    result.temp = process.env.STORM_TEMP_DIRECTORY;
  }

  return Object.keys(result).reduce((ret, key) => {
    if (result[key]) {
      const filePath = findFilePath(result[key]);
      result[key] = options?.appId
        ? joinPaths(filePath, options?.appId)
        : filePath;
    }

    return ret;
  }, {}) as EnvPaths;
}
