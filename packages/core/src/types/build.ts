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

/* eslint-disable ts/naming-convention */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { MaybePromise, NonUndefined } from "@stryke/types/base";
import type { TypeDefinition } from "@stryke/types/configuration";
import type { Hookable } from "hookable";
import { SourceFile } from "./compiler";
import type {
  BabelConfig,
  InlineConfig,
  OutputConfig,
  ResolvedUserConfig,
  UserConfig,
  WorkspaceConfig
} from "./config";
import { Context } from "./context";

export interface ResolvedEntryTypeDefinition extends TypeDefinition {
  /**
   * The user provided entry point in the source code
   */
  input: TypeDefinition;

  /**
   * An optional name to use in the package export during the build process
   */
  output?: string;
}

export type ConfigEnv = Pick<
  ResolvedOptions,
  "command" | "mode" | "environment" | "isSsrBuild" | "isPreview"
>;

export type UserConfigFnObject = (env: ConfigEnv) => UserConfig;
export type UserConfigFnPromise = (env: ConfigEnv) => Promise<UserConfig>;
export type UserConfigFn = (env: ConfigEnv) => UserConfig | Promise<UserConfig>;

export type UserConfigExport =
  | UserConfig
  | Promise<UserConfig>
  | UserConfigFnObject
  | UserConfigFnPromise
  | UserConfigFn;

export type ResolvedBabelOptions = Omit<BabelConfig, "plugins" | "presets"> &
  Required<Pick<BabelConfig, "plugins" | "presets">>;

/**
 * The resolved options for the Storm Stack project configuration.
 */
export type ResolvedOptions<
  TPluginsOptions extends Record<string, any> = Record<string, any>
> = Omit<WorkspaceConfig, "colors" | "logLevel"> &
  Required<Pick<WorkspaceConfig, "colors">> &
  Omit<
    InlineConfig,
    "root" | "type" | "babel" | "output" | "plugins" | "logLevel"
  > &
  Required<
    Pick<
      InlineConfig,
      | "command"
      | "name"
      | "templates"
      | "mode"
      | "environment"
      | "platform"
      | "tsconfig"
      | "esbuild"
      | "unbuild"
    >
  > & {
    /**
     * The configuration options that were provided inline to the Storm Stack CLI.
     */
    inlineConfig: InlineConfig;

    /**
     * The original configuration options that were provided by the user to the Storm Stack process.
     */
    userConfig: ResolvedUserConfig;

    /**
     * The Storm workspace configuration
     */
    workspaceConfig: WorkspaceConfig;

    /**
     * The Babel configuration options to use for the build process
     */
    babel: ResolvedBabelOptions;

    /**
     * The parsed TypeScript configuration for the project.
     */
    output: Required<OutputConfig>;

    /**
     * The root directory of the project.
     */
    projectRoot: NonUndefined<InlineConfig["root"]>;

    /**
     * The root directory of the project's source code
     *
     * @defaultValue "\{root\}/src"
     */
    sourceRoot: NonUndefined<InlineConfig["sourceRoot"]>;

    /**
     * The type of project being built.
     */
    projectType: NonUndefined<InlineConfig["type"]>;

    /**
     * The log level to use for the Storm Stack processes.
     *
     * @defaultValue "info"
     */
    logLevel?: LogLevelLabel | null;

    /**
     * A flag indicating whether the build is for server-side rendering (SSR).
     */
    isSsrBuild: boolean;

    /**
     * A flag indicating whether the build is for a preview environment.
     */
    isPreview: boolean;

    /**
     * The expected plugins options for the Storm Stack project.
     *
     * @remarks
     * This is a record of plugin identifiers to their respective options. This field is populated by the Storm Stack engine during both plugin initialization and the `init` command.
     */
    plugins: TPluginsOptions;
  };

export interface EngineHookFunctions<TContext extends Context = Context> {
  // New - Hooks used during the creation of a new project
  "new:begin": (context: TContext) => MaybePromise<void>;
  "new:library": (context: TContext) => MaybePromise<void>;
  "new:application": (context: TContext) => MaybePromise<void>;
  "new:complete": (context: TContext) => MaybePromise<void>;

  // Init - Hooks used during the initialization of the Storm Stack engine
  "init:begin": (context: TContext) => MaybePromise<void>;
  "init:options": (context: TContext) => MaybePromise<void>;
  "init:install": (context: TContext) => MaybePromise<void>;
  "init:tsconfig": (context: TContext) => MaybePromise<void>;
  "init:entry": (context: TContext) => MaybePromise<void>;
  "init:reflections": (context: TContext) => MaybePromise<void>;
  "init:complete": (context: TContext) => MaybePromise<void>;

  // Clean - Hooks used during the cleaning of the Storm Stack project
  "clean:begin": (context: TContext) => MaybePromise<void>;
  "clean:output": (context: TContext) => MaybePromise<void>;
  "clean:docs": (context: TContext) => MaybePromise<void>;
  "clean:complete": (context: TContext) => MaybePromise<void>;

  // Prepare - Hooks used during the preparation of the Storm Stack artifacts
  "prepare:begin": (context: TContext) => MaybePromise<void>;
  "prepare:config": (context: TContext) => MaybePromise<void>;
  "prepare:runtime": (context: TContext) => MaybePromise<void>;
  "prepare:entry": (context: TContext) => MaybePromise<void>;
  "prepare:types": (
    context: TContext,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "prepare:deploy": (context: TContext) => MaybePromise<void>;
  "prepare:complete": (context: TContext) => MaybePromise<void>;

  // Lint - Hooks used during the linting process
  "lint:begin": (context: TContext) => MaybePromise<void>;
  "lint:types": (context: TContext) => MaybePromise<void>;
  "lint:eslint": (context: TContext) => MaybePromise<void>;
  "lint:complete": (context: TContext) => MaybePromise<void>;

  // Build - Hooks used during the build process of the Storm Stack project
  "build:begin": (context: TContext) => MaybePromise<void>;
  "build:pre-transform": (
    context: TContext,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "build:transform": (
    context: TContext,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "build:post-transform": (
    context: TContext,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "build:library": (context: TContext) => MaybePromise<void>;
  "build:application": (context: TContext) => MaybePromise<void>;
  "build:complete": (context: TContext) => MaybePromise<void>;

  // Docs - Hooks used during the documentation generation process
  "docs:begin": (context: TContext) => MaybePromise<void>;
  "docs:api-reference": (context: TContext) => MaybePromise<void>;
  "docs:complete": (context: TContext) => MaybePromise<void>;

  // Finalize - Hooks used during the finalization of the Storm Stack project
  "finalize:begin": (context: TContext) => MaybePromise<void>;
  "finalize:complete": (context: TContext) => MaybePromise<void>;
}

export type EngineHooks<TContext extends Context = Context> = Hookable<
  EngineHookFunctions<TContext>
>;
