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

import type { MaybePromise, NonUndefined } from "@stryke/types/base";
import type { TypeDefinition } from "@stryke/types/configuration";
import type { TsConfigJson } from "@stryke/types/tsconfig";
import type { Hookable } from "hookable";
import ts from "typescript";
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

export type ParsedTypeScriptConfig = ts.ParsedCommandLine & {
  tsconfigJson: TsConfigJson;
  tsconfigFilePath: string;
};

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
export type ResolvedOptions<TExtraOptions = unknown> = WorkspaceConfig &
  Omit<InlineConfig, "root" | "type" | "babel" | "output"> &
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
  > &
  TExtraOptions & {
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
     * A flag indicating whether the build is for server-side rendering (SSR).
     */
    isSsrBuild: boolean;

    /**
     * A flag indicating whether the build is for a preview environment.
     */
    isPreview: boolean;
  };

export interface EngineHookFunctions {
  // New - Hooks used during the creation of a new project
  "new:begin": (context: Context) => MaybePromise<void>;
  "new:library": (context: Context) => MaybePromise<void>;
  "new:application": (context: Context) => MaybePromise<void>;
  "new:complete": (context: Context) => MaybePromise<void>;

  // Init - Hooks used during the initialization of the Storm Stack engine
  "init:begin": (context: Context) => MaybePromise<void>;
  "init:options": (context: Context) => MaybePromise<void>;
  "init:install": (context: Context) => MaybePromise<void>;
  "init:tsconfig": (context: Context) => MaybePromise<void>;
  "init:entry": (context: Context) => MaybePromise<void>;
  "init:reflections": (context: Context) => MaybePromise<void>;
  "init:complete": (context: Context) => MaybePromise<void>;

  // Clean - Hooks used during the cleaning of the Storm Stack project
  "clean:begin": (context: Context) => MaybePromise<void>;
  "clean:output": (context: Context) => MaybePromise<void>;
  "clean:docs": (context: Context) => MaybePromise<void>;
  "clean:complete": (context: Context) => MaybePromise<void>;

  // Prepare - Hooks used during the preparation of the Storm Stack artifacts
  "prepare:begin": (context: Context) => MaybePromise<void>;
  "prepare:config": (context: Context) => MaybePromise<void>;
  "prepare:runtime": (context: Context) => MaybePromise<void>;
  "prepare:entry": (context: Context) => MaybePromise<void>;
  "prepare:types": (
    context: Context,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "prepare:deploy": (context: Context) => MaybePromise<void>;
  "prepare:complete": (context: Context) => MaybePromise<void>;

  // Lint - Hooks used during the linting process
  "lint:begin": (context: Context) => MaybePromise<void>;
  "lint:types": (context: Context) => MaybePromise<void>;
  "lint:eslint": (context: Context) => MaybePromise<void>;
  "lint:complete": (context: Context) => MaybePromise<void>;

  // Build - Hooks used during the build process of the Storm Stack project
  "build:begin": (context: Context) => MaybePromise<void>;
  "build:pre-transform": (
    context: Context,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "build:transform": (
    context: Context,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "build:post-transform": (
    context: Context,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "build:library": (context: Context) => MaybePromise<void>;
  "build:application": (context: Context) => MaybePromise<void>;
  "build:complete": (context: Context) => MaybePromise<void>;

  // Docs - Hooks used during the documentation generation process
  "docs:begin": (context: Context) => MaybePromise<void>;
  "docs:api-reference": (context: Context) => MaybePromise<void>;
  "docs:complete": (context: Context) => MaybePromise<void>;

  // Finalize - Hooks used during the finalization of the Storm Stack project
  "finalize:begin": (context: Context) => MaybePromise<void>;
  "finalize:complete": (context: Context) => MaybePromise<void>;
}

export type EngineHooks = Hookable<EngineHookFunctions>;
