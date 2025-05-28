/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { TypeScriptBuildBaseEnv } from "@storm-software/build-tools/types";
import { LogLevel } from "./log.js";

/**
 * The base variables used by Storm Stack applications
 *
 * @remarks
 * This interface is used to define the environment variables, configuration options, and runtime settings used by the Storm Stack applications. It is used to provide type safety, autocompletion, and default values for the environment variables. The comments of each variable are used to provide documentation descriptions when running the \`storm docs\` command.
 *
 * @categoryDescription platform
 * The platform the variables are intended for use in.
 * @showCategories
 */
export interface StormBaseVariables {
  /**
   * An indicator that specifies the application is running in the local Storm Stack development environment.
   *
   * @defaultValue false
   *
   * @internal
   * @category node
   */
  STORM_STACK_LOCAL: boolean;

  /**
   * The name of the application.
   *
   * @category neutral
   */
  APP_NAME: string;

  /**
   * The version of the application.
   *
   * @defaultValue "1.0.0"
   *
   * @category neutral
   */
  APP_VERSION: string;

  /**
   * The unique identifier for the build.
   *
   * @category neutral
   */
  BUILD_ID: string;

  /**
   * The timestamp the build was ran at.
   *
   * @category neutral
   */
  BUILD_TIMESTAMP: number;

  /**
   * A checksum hash created during the build.
   *
   * @category neutral
   */
  BUILD_CHECKSUM: string;

  /**
   * The unique identifier for the release.
   *
   * @category neutral
   */
  RELEASE_ID: string;

  /**
   * The tag for the release. This is generally in the format of "\<APP_NAME\>\@\<APP_VERSION\>".
   *
   * @category neutral
   */
  RELEASE_TAG: string;

  /**
   * The name of the organization that maintains the application.
   *
   * @remarks
   * This variable is used to specify the name of the organization that maintains the application. If not provided in an environment, it will try to use the value in {@link @storm-software/config-tools/StormWorkspaceConfig#organization}.
   *
   * @category neutral
   */
  ORGANIZATION: string;

  /**
   * The platform for which the application was built.
   *
   * @defaultValue "node"
   *
   * @category neutral
   */
  PLATFORM: "node" | "browser";

  /**
   * The mode in which the application is running.
   *
   * @defaultValue "production"
   *
   * @category neutral
   */
  MODE: "development" | "staging" | "production";

  /**
   * The environment the application is running in. This value will be populated with the value of `MODE` if not provided.
   *
   * @defaultValue "production"
   *
   * @category neutral
   */
  ENVIRONMENT: string;

  /**
   * Indicates if the application is running in debug mode.
   *
   * @defaultValue false
   *
   * @category neutral
   */
  DEBUG: boolean;

  /**
   * An indicator that specifies the current runtime is a test environment.
   *
   * @defaultValue false
   *
   * @category neutral
   */
  TEST: boolean;

  /**
   * An indicator that specifies the current runtime is a minimal environment.
   *
   * @defaultValue false
   *
   * @category node
   */
  MINIMAL: boolean;

  /**
   * An indicator that specifies the current runtime is a no color environment.
   *
   * @defaultValue false
   *
   * @category node
   */
  NO_COLOR: boolean;

  /**
   * An indicator that specifies the current runtime is a force color environment.
   *
   * @defaultValue false
   *
   * @category node
   */
  FORCE_COLOR: boolean;

  /**
   * An indicator that specifies the current runtime should force hyperlinks in terminal output.
   *
   * @remarks
   * This variable is used to force hyperlinks in terminal output, even if the terminal does not support them. This is useful for debugging and development purposes.
   *
   * @defaultValue false
   *
   * @category node
   */
  FORCE_HYPERLINK: boolean;

  /**
   * The terminal type. This variable is set by certain CI/CD systems.
   *
   * @remarks
   * This variable is used to specify the terminal type that the application is running in. It can be used to determine how to format output for the terminal.
   *
   * @category node
   */
  TERM?: string;

  /**
   * The terminal program name. This variable is set by certain terminal emulators.
   *
   * @category node
   * @hidden
   */
  TERM_PROGRAM: string;

  /**
   * The terminal program version. This variable is set by certain terminal emulators.
   *
   * @category node
   * @hidden
   */
  TERM_PROGRAM_VERSION: string;

  /**
   * The terminal emulator name. This variable is set by certain terminal emulators.
   *
   * @category node
   * @hidden
   */
  TERMINAL_EMULATOR?: string;

  /**
   * The terminal emulator session ID. This variable is set by certain terminal emulators.
   *
   * @category node
   * @hidden
   */
  WT_SESSION?: string;

  /**
   * An indicator that specifies the current terminal is running Terminus Sublime. This variable is set by certain terminal emulators.
   *
   * @category node
   * @hidden
   */
  TERMINUS_SUBLIME?: boolean;

  /**
   * The ConEmu task name. This variable is set by certain terminal emulators.
   *
   * @category node
   * @hidden
   */
  ConEmuTask?: string;

  /**
   * The cursor trace ID. This variable is set by certain terminal emulators.
   *
   * @category node
   * @hidden
   */
  CURSOR_TRACE_ID?: string;

  /**
   * The VTE version. This variable is set by certain terminal emulators.
   *
   * @category node
   * @hidden
   */
  VTE_VERSION?: string;

  /**
   * The environment the application is running in. This variable is a duplicate of `ENVIRONMENT` to support use in external packages.
   *
   * @defaultValue "production"
   *
   * @category neutral
   * @deprecated Use `ENVIRONMENT` instead.
   * @hidden
   */
  NODE_ENV: "development" | "staging" | "production";

  /**
   * Indicates if error stack traces should be captured.
   *
   * @defaultValue false
   *
   * @category neutral
   */
  STACKTRACE: boolean;

  /**
   * Indicates if error data should be included.
   *
   * @defaultValue false
   *
   * @category neutral
   */
  INCLUDE_ERROR_DATA: boolean;

  /**
   * An API end point to lookup error messages given an error code.
   *
   * @remarks
   * This variable is used to provide a URL to an API that can be used to look up error messages given an error code. This is used to provide a more user-friendly error message to the user.
   *
   * @category neutral
   */
  ERROR_URL: string;

  /**
   * The default timezone for the application.
   *
   * @defaultValue "America/New_York"
   *
   * @category neutral
   */
  DEFAULT_TIMEZONE: string;

  /**
   * The default locale for the application.
   *
   * @defaultValue "en_US"
   *
   * @category neutral
   */
  DEFAULT_LOCALE: string;

  /**
   * The default lowest log level to accept. If `null`, the logger will reject all records. This value only applies if `lowestLogLevel` is not provided to the `logs` configuration.
   *
   * @defaultValue "info"
   *
   * @category neutral
   */
  LOG_LEVEL?: LogLevel | null;

  /**
   * An indicator that specifies the current runtime is a continuous integration environment.
   *
   * @remarks
   * This variable is also set using the `CONTINUOUS_INTEGRATION` environment variable.
   *
   * @defaultValue false
   *
   * @category neutral
   */
  CI: boolean;

  /**
   * An indicator that specifies the current runtime is a continuous integration environment.
   *
   * @remarks
   * This variable is also set using the `CI` environment variable.
   *
   * @defaultValue false
   *
   * @category neutral
   * @hidden
   */
  CONTINUOUS_INTEGRATION: boolean;

  /**
   * The unique identifier for the current run. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  RUN_ID?: string;

  /**
   * The agola git reference. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  AGOLA_GIT_REF?: string;

  /**
   * The appcircle build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  AC_APPCIRCLE?: string;

  /**
   * The appveyor build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  APPVEYOR?: string;

  /**
   * The codebuild build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  CODEBUILD?: string;

  /**
   * The task force build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  TF_BUILD?: string;

  /**
   * The bamboo plan key. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  bamboo_planKey?: string;

  /**
   * The bitbucket commit. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  BITBUCKET_COMMIT?: string;

  /**
   * The bitrise build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  BITRISE_IO?: string;

  /**
   * The buddy workspace ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  BUDDY_WORKSPACE_ID?: string;

  /**
   * The buildkite build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  BUILDKITE?: string;

  /**
   * The circleci build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  CIRCLECI?: string;

  /**
   * The cirrusci build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  CIRRUS_CI?: string;

  /**
   * The cf build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  CF_BUILD_ID?: string;

  /**
   * The cm build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  CM_BUILD_ID?: string;

  /**
   * The ci name. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  CI_NAME?: string;

  /**
   * The drone build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  DRONE?: string;

  /**
   * The dsari build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  DSARI?: string;

  /**
   * The earthly build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  EARTHLY_CI?: string;

  /**
   * The eas build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  EAS_BUILD?: string;

  /**
   * The gerrit project. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  GERRIT_PROJECT?: string;

  /**
   * The gitea actions build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  GITEA_ACTIONS?: string;

  /**
   * The github actions build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  GITHUB_ACTIONS?: string;

  /**
   * The gitlab ci build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  GITLAB_CI?: string;

  /**
   * The go cd build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  GOCD?: string;

  /**
   * The builder output build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  BUILDER_OUTPUT?: string;

  /**
   * The harness build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  HARNESS_BUILD_ID?: string;

  /**
   * The jenkins url. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  JENKINS_URL?: string;

  /**
   * The layerci build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  LAYERCI?: string;

  /**
   * The magnum build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  MAGNUM?: string;

  /**
   * The netlify build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  NETLIFY?: string;

  /**
   * The nevercode build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  NEVERCODE?: string;

  /**
   * The prow job ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  PROW_JOB_ID?: string;

  /**
   * The release build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  RELEASE_BUILD_ID?: string;

  /**
   * The render build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  RENDER?: string;

  /**
   * The sailci build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  SAILCI?: string;

  /**
   * The hudson build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  HUDSON?: string;

  /**
   * The screwdriver build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  SCREWDRIVER?: string;

  /**
   * The semaphore build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  SEMAPHORE?: string;

  /**
   * The sourcehut build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  SOURCEHUT?: string;

  /**
   * The strider build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  STRIDER?: string;

  /**
   * The task ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  TASK_ID?: string;

  /**
   * The teamcity version. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  TEAMCITY_VERSION?: string;

  /**
   * The travis build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  TRAVIS?: string;

  /**
   * The vela build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  VELA?: string;

  /**
   * The now builder build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  NOW_BUILDER?: string;

  /**
   * The appcenter build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  APPCENTER_BUILD_ID?: string;

  /**
   * The xcode project build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  CI_XCODE_PROJECT?: string;

  /**
   * The xcode server build ID. This value is set by certain CI/CD systems.
   *
   * @category node
   * @hidden
   */
  XCS?: string;

  /**
   * The Vercel environment. This variable is set by Vercel when the application is running in a Vercel environment.
   *
   * @category node
   * @hidden
   */
  VERCEL_ENV?: string;

  /**
   * The Storm Stack application's runtime data directory.
   *
   * @remarks
   * This variable is used to override the base path of the system's local application data directory. This variable is used to set the \`$storm.paths.data\` property.
   *
   * @category node
   */
  STORM_DATA_DIR?: string;

  /**
   * The Storm Stack application's configuration data directory.
   *
   * @remarks
   * This variable is used to override the base path of the system's local application configuration directory. This variable is used to set the \`$storm.paths.config\` property.
   *
   * @category node
   */
  STORM_CONFIG_DIR?: string;

  /**
   * The Storm Stack application's cached data directory.
   *
   * @remarks
   * This variable is used to override the base path of the system's local cache data directory. This variable is used to set the \`$storm.paths.cache\` property.
   *
   * @category node
   */
  STORM_CACHE_DIR?: string;

  /**
   * The Storm Stack application's logging directory.
   *
   * @remarks
   * This variable is used to override the base path of the system's local application log directory. This variable is used to set the \`$storm.paths.log\` property.
   *
   * @category node
   */
  STORM_LOG_DIR?: string;

  /**
   * The Storm Stack application's temporary data directory.
   *
   * @remarks
   * This variable is used to override the base path of the system's local temporary data directory. This variable is used to set the \`$storm.paths.temp\` property.
   *
   * @category node
   */
  STORM_TEMP_DIR?: string;

  /**
   * A variable that specifies the current user's local application data directory on Windows.
   *
   * @see https://www.advancedinstaller.com/appdata-localappdata-programdata.html
   *
   * @remarks
   * This variable is used to specify a path to application data that is specific to the current user. This variable can be used to set the \`$storm.paths.data\`, \`$storm.paths.cache\`, and \`$storm.paths.log\` properties.
   *
   * @category node
   */
  LOCALAPPDATA?: string;

  /**
   * A variable that specifies the application data directory on Windows.
   *
   * @see https://www.advancedinstaller.com/appdata-localappdata-programdata.html
   *
   * @remarks
   * This variable is used to specify a path to application data that is specific to the current user. This variable can be used to set the \`$storm.paths.config\` property.
   *
   * @category node
   */
  APPDATA?: string;

  /**
   * A variable that specifies the data path in the home directory on Linux systems using the XDG base directory specification.
   *
   * @see https://gist.github.com/roalcantara/107ba66dfa3b9d023ac9329e639bc58c
   *
   * @remarks
   * This variable is used to specify a path to application data that is specific to the current user. This variable can be used to set the \`$storm.paths.data\` property.
   *
   * @category node
   */
  XDG_DATA_HOME?: string;

  /**
   * A variable that specifies the configuration path in the home directory on Linux systems using the XDG base directory specification.
   *
   * @see https://gist.github.com/roalcantara/107ba66dfa3b9d023ac9329e639bc58c
   *
   * @remarks
   * This variable is used to specify a path to configuration data that is specific to the current user. This variable can be used to set the \`$storm.paths.config\` property.
   *
   * @category node
   */
  XDG_CONFIG_HOME?: string;

  /**
   * A variable that specifies the cache path in the home directory on Linux systems using the XDG base directory specification.
   *
   * @see https://gist.github.com/roalcantara/107ba66dfa3b9d023ac9329e639bc58c
   *
   * @remarks
   * This variable is used to specify a path to cache data that is specific to the current user. This variable can be used to set the \`$storm.paths.cache\` property.
   *
   * @category node
   */
  XDG_CACHE_HOME?: string;

  /**
   * A variable that specifies the state directory on Linux systems using the XDG base directory specification.
   *
   * @see https://gist.github.com/roalcantara/107ba66dfa3b9d023ac9329e639bc58c
   *
   * @remarks
   * This variable is used to specify a path to application state data that is specific to the current user. This variable can be used to set the \`$storm.paths.state\` property.
   *
   * @category node
   */
  XDG_STATE_HOME?: string;

  /**
   * A variable that specifies the runtime directory on Linux systems using the XDG base directory specification.
   *
   * @see https://gist.github.com/roalcantara/107ba66dfa3b9d023ac9329e639bc58c
   *
   * @remarks
   * This variable is used to specify a path to runtime data that is specific to the current user. This variable can be used to set the \`$storm.paths.temp\` property.
   *
   * @category node
   */
  XDG_RUNTIME_DIR?: string;

  /**
   * A variable that specifies the [Devenv](https://devenv.sh/) runtime directory.
   *
   * @see https://devenv.sh/files-and-variables/#devenv_dotfile
   * @see https://nixos.org/
   *
   * @remarks
   * This variable is used to specify a path to application data that is specific to the current [Nix](https://nixos.org/) environment. This variable can be used to set the \`$storm.paths.temp\` property.
   *
   * @category node
   */
  DEVENV_RUNTIME?: string;
}

/**
 * The variables used by the Storm Stack application
 */
export type StormVars = {
  [TKey in Uppercase<string>]: TKey extends `STORM_${infer TBaseKey}`
    ? `STORM_${TBaseKey}` extends keyof TypeScriptBuildBaseEnv
      ? TypeScriptBuildBaseEnv[`STORM_${TBaseKey}`]
      : any
    : any;
} & StormBaseVariables;
