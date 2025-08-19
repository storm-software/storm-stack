/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevel } from "./log.js";

/**
 * The base configuration used by Storm Stack applications
 *
 * @remarks
 * This interface is used to define the environment variables, configuration options, and runtime settings used by the Storm Stack applications. It is used to provide type safety, autocompletion, and default values for the environment variables. The comments of each variable are used to provide documentation descriptions when running the \`storm docs\` command.
 *
 * @categoryDescription Platform
 * The name of the platform the configuration parameter is intended for use in.
 *
 * @showCategories
 */
export interface StormConfigInterface {
  /**
   * A virtual object representing the configuration parameters for the Storm application at build time. The Storm Stack build process will inject this object's values with the actual configuration parameters at build time.
   *
   * @example
   * ```typescript
   * // "$storm.config.static.CONFIG_ITEM" will be replaced with the actual value at build time
   * const value = $storm.config.static.CONFIG_ITEM;
   *
   * const someNumber = $storm.config.static.SOME_NUMBER;
   * // const someNumber = 42;
   *
   * const someString = $storm.config.static.SOME_STRING;
   * // const someString = "Hello, World!";
   *
   * const someBoolean = $storm.config.static.SOME_BOOLEAN;
   * // const someBoolean = true;
   * ```
   *
   * @remarks
   * A static representation of the configuration thats used to inject data into the application code at build time. This object will can provide type safety and autocompletion for the configuration values when used in the application code. **The values on this object will not exist at runtime.**
   *
   * @internal
   * @readonly
   */
  readonly static: any;

  /**
   * An indicator that specifies the application is running in the local Storm Stack development environment.
   *
   * @defaultValue false
   *
   * @hidden
   * @readonly
   * @category node
   */
  STORM_STACK_LOCAL?: boolean;

  /**
   * The name of the application.
   *
   * @readonly
   * @category neutral
   */
  APP_NAME: string;

  /**
   * The version of the application.
   *
   * @defaultValue "1.0.0"
   *
   * @readonly
   * @category neutral
   */
  APP_VERSION: string;

  /**
   * The unique identifier for the build.
   *
   * @readonly
   * @category neutral
   */
  BUILD_ID: string;

  /**
   * The timestamp the build was ran at.
   *
   * @readonly
   * @category neutral
   */
  BUILD_TIMESTAMP: string;

  /**
   * A checksum hash created during the build.
   *
   * @readonly
   * @category neutral
   */
  BUILD_CHECKSUM: string;

  /**
   * The unique identifier for the release.
   *
   * @readonly
   * @category neutral
   */
  RELEASE_ID: string;

  /**
   * The tag for the release. This is generally in the format of "\<APP_NAME\>\@\<APP_VERSION\>".
   *
   * @readonly
   * @category neutral
   */
  RELEASE_TAG: string;

  /**
   * The name of the organization that maintains the application.
   *
   * @remarks
   * This variable is used to specify the name of the organization that maintains the application. If not provided in an environment, it will try to use the value in {@link @storm-software/config-tools/StormWorkspaceConfig#organization}.
   *
   * @alias ORG
   * @alias ORG_ID
   * @category neutral
   */
  ORGANIZATION: string;

  /**
   * The platform for which the application was built.
   *
   * @defaultValue "neutral"
   *
   * @category neutral
   */
  PLATFORM: "node" | "neutral" | "browser";

  /**
   * The mode in which the application is running.
   *
   * @defaultValue "production"
   *
   * @alias NODE_ENV
   *
   * @category neutral
   */
  MODE: "development" | "staging" | "production";

  /**
   * The environment the application is running in. This value will be populated with the value of `MODE` if not provided.
   *
   * @defaultValue "production"
   *
   * @alias ENV
   * @alias VERCEL_ENV
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
  FORCE_COLOR: boolean | number;

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
  FORCE_HYPERLINK: boolean | number;

  /**
   * The name of the agent running the application. This variable is set by certain CI/CD systems.
   *
   * @readonly
   * @category neutral
   */
  AGENT_NAME?: string;

  /**
   * The color terminal type. This variable is set by certain terminal emulators.
   *
   * @readonly
   * @category node
   */
  COLORTERM?: string;

  /**
   * The terminal type. This variable is set by certain CI/CD systems.
   *
   * @remarks
   * This variable is used to specify the terminal type that the application is running in. It can be used to determine how to format output for the terminal.
   *
   * @readonly
   * @category node
   */
  TERM?: string;

  /**
   * The terminal program name. This variable is set by certain terminal emulators.
   *
   * @readonly
   * @category node
   */
  TERM_PROGRAM?: string;

  /**
   * The terminal program version. This variable is set by certain terminal emulators.
   *
   * @readonly
   * @category node
   */
  TERM_PROGRAM_VERSION?: string;

  /**
   * The terminal emulator name. This variable is set by certain terminal emulators.
   *
   * @readonly
   * @category node
   */
  TERMINAL_EMULATOR?: string;

  /**
   * The terminal emulator session ID. This variable is set by certain terminal emulators.
   *
   * @readonly
   * @category node
   */
  WT_SESSION?: string;

  /**
   * An indicator that specifies the current terminal is running Terminus Sublime. This variable is set by certain terminal emulators.
   *
   * @readonly
   * @category node
   */
  TERMINUS_SUBLIME?: boolean;

  /**
   * The ConEmu task name. This variable is set by certain terminal emulators.
   *
   * @readonly
   * @category node
   */
  ConEmuTask?: string;

  /**
   * The cursor trace ID. This variable is set by certain terminal emulators.
   *
   * @readonly
   * @category node
   */
  CURSOR_TRACE_ID?: string;

  /**
   * The VTE version. This variable is set by certain terminal emulators.
   *
   * @readonly
   * @category node
   */
  VTE_VERSION?: string;

  /**
   * Indicates if error stack traces should be captured.
   *
   * @defaultValue false
   * @category neutral
   */
  STACKTRACE: boolean;

  /**
   * Indicates if error data should be included.
   *
   * @defaultValue false
   * @category neutral
   */
  INCLUDE_ERROR_DATA: boolean;

  /**
   * A web page to lookup error messages and display additional information given an error code.
   *
   * @remarks
   * This variable is used to provide a URL to a page that can be used to look up error messages given an error code. This is used to provide a more user-friendly error message to the user.
   *
   * @title Error Details URL
   * @category neutral
   */
  ERROR_URL: string;

  /**
   * The default timezone for the application.
   *
   * @defaultValue "America/New_York"
   * @category neutral
   */
  DEFAULT_TIMEZONE: string;

  /**
   * The default locale to be used in the application.
   *
   * @defaultValue "en_US"
   * @readonly
   * @category neutral
   */
  DEFAULT_LOCALE: string;

  /**
   * The default lowest log level to accept. If `null`, the logger will reject all records. This value only applies if `lowestLogLevel` is not provided to the `logs` configuration.
   *
   * @defaultValue "info"
   * @category neutral
   */
  LOG_LEVEL?: LogLevel | null;

  /**
   * An indicator that specifies the current runtime is a continuous integration environment.
   *
   * @defaultValue false
   *
   * @title Continuous Integration
   * @alias CONTINUOUS_INTEGRATION
   * @category neutral
   */
  CI: boolean;

  /**
   * The unique identifier for the current run. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  RUN_ID?: string;

  /**
   * The agola git reference. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  AGOLA_GIT_REF?: string;

  /**
   * The appcircle build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  AC_APPCIRCLE?: string;

  /**
   * The appveyor build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  APPVEYOR?: string;

  /**
   * The codebuild build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  CODEBUILD?: string;

  /**
   * The task force build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  TF_BUILD?: string;

  /**
   * The bamboo plan key. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  bamboo_planKey?: string;

  /**
   * The bitbucket commit. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  BITBUCKET_COMMIT?: string;

  /**
   * The bitrise build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  BITRISE_IO?: string;

  /**
   * The buddy workspace ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  BUDDY_WORKSPACE_ID?: string;

  /**
   * The buildkite build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  BUILDKITE?: string;

  /**
   * The circleci build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  CIRCLECI?: string;

  /**
   * The cirrus-ci build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  CIRRUS_CI?: string;

  /**
   * The cf build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  CF_BUILD_ID?: string;

  /**
   * The cm build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  CM_BUILD_ID?: string;

  /**
   * The ci name. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  CI_NAME?: string;

  /**
   * The drone build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  DRONE?: string;

  /**
   * The dsari build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  DSARI?: string;

  /**
   * The earthly build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  EARTHLY_CI?: string;

  /**
   * The eas build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  EAS_BUILD?: string;

  /**
   * The gerrit project. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  GERRIT_PROJECT?: string;

  /**
   * The gitea actions build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  GITEA_ACTIONS?: string;

  /**
   * The github actions build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  GITHUB_ACTIONS?: string;

  /**
   * The gitlab ci build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  GITLAB_CI?: string;

  /**
   * The go cd build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  GOCD?: string;

  /**
   * The builder output build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  BUILDER_OUTPUT?: string;

  /**
   * The harness build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  HARNESS_BUILD_ID?: string;

  /**
   * The jenkins url. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  JENKINS_URL?: string;

  /**
   * The layerci build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  LAYERCI?: string;

  /**
   * The magnum build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  MAGNUM?: string;

  /**
   * The netlify build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  NETLIFY?: string;

  /**
   * The nevercode build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  NEVERCODE?: string;

  /**
   * The prow job ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  PROW_JOB_ID?: string;

  /**
   * The release build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  RELEASE_BUILD_ID?: string;

  /**
   * The render build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  RENDER?: string;

  /**
   * The sailci build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  SAILCI?: string;

  /**
   * The hudson build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  HUDSON?: string;

  /**
   * The screwdriver build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  SCREWDRIVER?: string;

  /**
   * The semaphore build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  SEMAPHORE?: string;

  /**
   * The sourcehut build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  SOURCEHUT?: string;

  /**
   * The strider build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  STRIDER?: string;

  /**
   * The task ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  TASK_ID?: string;

  /**
   * The teamcity version. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  TEAMCITY_VERSION?: string;

  /**
   * The travis build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  TRAVIS?: string;

  /**
   * The vela build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  VELA?: string;

  /**
   * The now builder build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  NOW_BUILDER?: string;

  /**
   * The appcenter build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  APPCENTER_BUILD_ID?: string;

  /**
   * The xcode project build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  CI_XCODE_PROJECT?: string;

  /**
   * The xcode server build ID. This value is set by certain CI/CD systems.
   *
   * @readonly
   * @category node
   */
  XCS?: string;

  /**
   * The Storm Stack application's runtime data directory.
   *
   * @remarks
   * This variable is used to override the base path of the system's local application data directory. This variable is used to set the \`$storm.paths.data\` property.
   *
   * @title Data Directory
   * @category node
   */
  DATA_DIR?: string;

  /**
   * The Storm Stack application's configuration data directory.
   *
   * @remarks
   * This variable is used to override the base path of the system's local application configuration directory. This variable is used to set the \`$storm.paths.config\` property.
   *
   * @title Configuration Directory
   * @category node
   */
  CONFIG_DIR?: string;

  /**
   * The Storm Stack application's cached data directory.
   *
   * @remarks
   * This variable is used to override the base path of the system's local cache data directory. This variable is used to set the \`$storm.paths.cache\` property.
   *
   * @title Cache Directory
   * @category node
   */
  CACHE_DIR?: string;

  /**
   * The Storm Stack application's logging directory.
   *
   * @remarks
   * This variable is used to override the base path of the system's local application log directory. This variable is used to set the \`$storm.paths.log\` property.
   *
   * @title Log Directory
   * @category node
   */
  LOG_DIR?: string;

  /**
   * The Storm Stack application's temporary data directory.
   *
   * @remarks
   * This variable is used to override the base path of the system's local temporary data directory. This variable is used to set the \`$storm.paths.temp\` property.
   *
   * @title Temporary Directory
   * @category node
   */
  TEMP_DIR?: string;

  /**
   * A variable that specifies the current user's local application data directory on Windows.
   *
   * @see https://www.advancedinstaller.com/appdata-localappdata-programdata.html
   *
   * @remarks
   * This variable is used to specify a path to application data that is specific to the current user. This variable can be used to set the \`$storm.paths.data\`, \`$storm.paths.cache\`, and \`$storm.paths.log\` properties.
   *
   * @readonly
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
   * @readonly
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
   * @readonly
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
   * @readonly
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
   * @readonly
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
   * @readonly
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
   * @readonly
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
