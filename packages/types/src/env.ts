/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

/* eslint-disable ts/consistent-type-imports */

import { TypeScriptBuildBaseEnv } from "@storm-software/build-tools/types";
import { LogLevel } from "./log.js";

export interface StormEnvVariables {
  /**
   * The name of the application.
   */
  APP_NAME: string;

  /**
   * The version of the application.
   *
   * @defaultValue "1.0.0"
   */
  APP_VERSION: string;

  /**
   * The unique identifier for the build.
   */
  BUILD_ID: string;

  /**
   * The timestamp the build was ran at.
   */
  BUILD_TIMESTAMP: number;

  /**
   * A checksum hash created during the build.
   */
  BUILD_CHECKSUM: string;

  /**
   * The unique identifier for the release.
   */
  RELEASE_ID: string;

  /**
   * The platform for which the application was built.
   *
   * @defaultValue "node"
   */
  PLATFORM: "node" | "browser" | "worker";

  /**
   * The mode in which the application is running.
   *
   * @defaultValue "production"
   */
  MODE: "development" | "staging" | "production";

  /**
   * The environment the application is running in. This value will be populated with the value of `MODE` if not provided.
   *
   * @defaultValue "production"
   */
  ENVIRONMENT: string;

  /**
   * Indicates if the application is running in development mode.
   *
   * @defaultValue false
   */
  DEVELOPMENT: boolean;

  /**
   * Indicates if the application is running in staging mode.
   *
   * @defaultValue false
   */
  STAGING: boolean;

  /**
   * Indicates if the application is running in production mode.
   *
   * @defaultValue true
   */
  PRODUCTION: boolean;

  /**
   * Indicates if the application is running in debug mode.
   *
   * @defaultValue false
   */
  DEBUG: boolean;

  /**
   * The environment the application is running in. This variable is a duplicate of `ENVIRONMENT` to support use in external packages.
   *
   * @defaultValue "production"
   */
  NODE_ENV: "development" | "staging" | "production";

  /**
   * Indicates if error stack traces should be captured.
   *
   * @defaultValue false
   */
  STACKTRACE: boolean;

  /**
   * Indicates if error data should be included.
   *
   * @defaultValue false
   */
  INCLUDE_ERROR_DATA: boolean;

  /**
   * The URL to send error data to. This value is used by the Storm Stack error tracking system.
   */
  ERROR_URL: string;

  /**
   * The default timezone for the application.
   *
   * @defaultValue "America/New_York"
   */
  DEFAULT_TIMEZONE: string;

  /**
   * The default locale for the application.
   *
   * @defaultValue "en_US"
   */
  DEFAULT_LOCALE: string;

  /**
   * The default lowest log level to accept. If `null`, the logger will reject all records. This value only applies if `lowestLogLevel` is not provided to the `logs` configuration.
   *
   * @defaultValue "info"
   */
  LOG_LEVEL?: LogLevel | null;

  /**
   * A file system path to write out logs to.
   */
  LOG_PATH?: string;
}

/**
 * The environment variables used by the Storm Stack application
 */
export type StormEnv = {
  [TKey in Uppercase<string>]: TKey extends `STORM_${infer TBaseKey}`
    ? `STORM_${TBaseKey}` extends keyof TypeScriptBuildBaseEnv
      ? TypeScriptBuildBaseEnv[`STORM_${TBaseKey}`]
      : any
    : any;
} & StormEnvVariables;
