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

import type { LogLevelLabel } from "@storm-software/config-tools/types";
import type {
  DotenvConfiguration,
  TypeDefinitionParameter
} from "@stryke/types/utility-types/configuration";
import type { LogLevel } from "./global";

export type LogFn = (type: LogLevelLabel, ...args: string[]) => void;

export interface DotenvTypeDefinitionOptions {
  /**
   * A path to the type definition for the expected env configuration parameters. This value can include both a path to the typescript file and the name of the type definition to use separated by a `":"` or `"#"` character. For example: `"./src/types/env.ts#DotenvConfiguration"`.
   *
   * @remarks
   * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.dotenv.types.variables` object in the project's `package.json` file.
   */
  variables?: TypeDefinitionParameter;

  /**
   * A path to the type definition for the expected env secret parameters. This value can include both a path to the typescript file and the name of the type definition to use separated by a `":"` or `"#"` character. For example: `"./src/types/env.ts#DotenvSecrets"`.
   *
   * @remarks
   * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.dotenv.types.secrets` object in the project's `package.json` file.
   */
  secrets?: TypeDefinitionParameter;
}

export interface DotenvOptions extends DotenvConfiguration {
  /**
   * The type definitions for the environment variables
   *
   * @remarks
   * If a value is not provided for this option, the plugin will attempt to infer the type definition from the `storm.dotenv.types` object in the project's `package.json` file.
   */
  types?: DotenvTypeDefinitionOptions | string;

  /**
   * Should the plugin replace the env variables in the source code with their values?
   *
   * @remarks
   * This option is set to `true` when building an application project.
   *
   * @defaultValue false
   */
  replace?: boolean;

  /**
   * Generate a markdown file that documents the variables and secrets used in the project.
   *
   * @remarks
   * This field's value will either be a string representing a path to the markdown file to generate, or `false` to disable the generation of the file.
   *
   * @defaultValue "\{projectRoot\}/docs/generated/dotenv.md"
   */
  docgen?: string | false;
}

// export type Plugin =
//   | "filesystem"
//   | "database"
//   | "cache"
//   | "queue"
//   | "mail"
//   | "http"
//   | "websocket"
//   | "other";

export interface LogConfig {
  /**
   * The {@link LogSink} definition
   */
  sink: TypeDefinitionParameter;

  /**
   * The lowest log level for the sink to accept.
   */
  logLevel: LogLevel;
}

export type PluginConfig = [string, Record<string, any>];

export interface ProjectConfig {
  /**
   * The name of the project
   */
  name?: string;

  /**
   * The entry point for the project
   *
   * @remarks
   * This is only used for applications. Libraries will have a separate entry point added for each file.
   */
  entry?: TypeDefinitionParameter | TypeDefinitionParameter[];

  /**
   * The type of project being built
   *
   * @defaultValue "application"
   */
  projectType?: "application" | "library";

  /**
   * A list of resolvable paths to plugins used during the build process
   */
  plugins?: Array<string | PluginConfig>;

  /**
   * Options to control .env file processing
   */
  dotenv?: DotenvOptions;

  /**
   * The name of the generated declaration (.d.ts) file to use for the Storm global variables. Set `false` to disable - no file will be generated.
   *
   * @defaultValue "{projectRoot}/.storm/types/env.d.ts"
   */
  dts?: string | false;

  /**
   * The log configuration for the project
   */
  logs?: LogConfig | LogConfig[];
}
