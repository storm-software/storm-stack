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
import type {
  DeepPartial,
  MaybePromise,
  NonUndefined
} from "@stryke/types/base";
import type { TypeDefinition } from "@stryke/types/configuration";
import { BuildOptions, Loader, PluginBuild } from "esbuild";
import type { Hookable } from "hookable";
import {
  HmrContext,
  IndexHtmlTransformContext,
  IndexHtmlTransformResult,
  ModuleNode,
  PreviewServer,
  ResolvedConfig,
  ViteDevServer
} from "vite";
import { SourceFile } from "./compiler";
import type {
  BabelConfig,
  ESBuildUserConfig,
  InlineConfig,
  OutputConfig,
  ResolvedUserConfig,
  RolldownUserConfig,
  RollupUserConfig,
  RspackUserConfig,
  StandaloneApplicationUserConfig,
  StandaloneLibraryUserConfig,
  TsupUserConfig,
  UnbuildUserConfig,
  UserConfig,
  ViteOptions,
  ViteUserConfig,
  WebpackUserConfig,
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

export type UserConfigFnObject = (env: ConfigEnv) => DeepPartial<UserConfig>;
export type UserConfigFnPromise = (
  env: ConfigEnv
) => Promise<DeepPartial<UserConfig>>;
export type UserConfigFn = (
  env: ConfigEnv
) => UserConfig | Promise<DeepPartial<UserConfig>>;

export type UserConfigExport =
  | DeepPartial<UserConfig>
  | Promise<DeepPartial<UserConfig>>
  | UserConfigFnObject
  | UserConfigFnPromise
  | UserConfigFn;

export type ResolvedBabelOptions = Omit<BabelConfig, "plugins" | "presets"> &
  Required<Pick<BabelConfig, "plugins" | "presets">>;

/**
 * The resolved options for the Storm Stack project configuration.
 */
export type BaseResolvedOptions<
  TUserConfig extends UserConfig = UserConfig,
  TPluginsOptions extends Record<string, any> = Record<string, any>
> = Required<Pick<WorkspaceConfig, "workspaceRoot">> &
  Omit<
    TUserConfig,
    | "name"
    | "mode"
    | "environment"
    | "name"
    | "mode"
    | "environment"
    | "platform"
    | "tsconfig"
    | "build"
    | "override"
    | "root"
    | "variant"
    | "type"
    | "babel"
    | "output"
    | "plugins"
    | "logLevel"
  > &
  Required<
    Pick<
      TUserConfig,
      | "name"
      | "mode"
      | "environment"
      | "platform"
      | "tsconfig"
      | "build"
      | "override"
    >
  > & {
    /**
     * The configuration options that were provided inline to the Storm Stack CLI.
     */
    inlineConfig: InlineConfig<TUserConfig>;

    /**
     * The original configuration options that were provided by the user to the Storm Stack process.
     */
    userConfig: ResolvedUserConfig<TUserConfig>;

    /**
     * The Storm workspace configuration
     */
    workspaceConfig: WorkspaceConfig;

    /**
     * A string identifier for the Storm Stack command being executed.
     */
    command: NonUndefined<InlineConfig<TUserConfig>["command"]>;

    /**
     * The build variant being used by the Storm Stack engine.
     */
    variant: NonUndefined<TUserConfig["variant"]>;

    /**
     * The root directory of the workspace
     */
    workspaceRoot: NonUndefined<WorkspaceConfig["workspaceRoot"]>;

    /**
     * The root directory of the project's source code
     *
     * @defaultValue "\{projectRoot\}/src"
     */
    sourceRoot: NonUndefined<TUserConfig["sourceRoot"]>;

    /**
     * The root directory of the project.
     */
    projectRoot: NonUndefined<TUserConfig["root"]>;

    /**
     * The type of project being built.
     */
    projectType: NonUndefined<TUserConfig["type"]>;

    /**
     * The Babel configuration options to use for the build process
     */
    babel: ResolvedBabelOptions;

    /**
     * The parsed TypeScript configuration for the project.
     */
    output: Required<OutputConfig>;

    /**
     * A flag indicating whether the build is for server-side rendering (SSR).
     */
    isSsrBuild: boolean;

    /**
     * A flag indicating whether the build is for a preview environment.
     */
    isPreview: boolean;

    /**
     * The log level to use for the Storm Stack processes.
     *
     * @defaultValue "info"
     */
    logLevel: LogLevelLabel | null;

    /**
     * The expected plugins options for the Storm Stack project.
     *
     * @remarks
     * This is a record of plugin identifiers to their respective options. This field is populated by the Storm Stack engine during both plugin initialization and the `init` command.
     */
    plugins: TPluginsOptions;
  };

export type ViteResolvedOptions<
  TPluginsOptions extends Record<string, any> = Record<string, any>
> = BaseResolvedOptions<ViteUserConfig, TPluginsOptions> & {
  /**
   * The configuration options that were provided inline to the Storm Stack CLI.
   */
  inlineConfig: InlineConfig<ViteUserConfig>;

  /**
   * The original configuration options that were provided by the user to the Storm Stack process.
   */
  userConfig: ResolvedUserConfig<ViteUserConfig>;

  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "vite";
};

export type WebpackResolvedOptions<
  TPluginsOptions extends Record<string, any> = Record<string, any>
> = BaseResolvedOptions<WebpackUserConfig, TPluginsOptions> & {
  /**
   * The configuration options that were provided inline to the Storm Stack CLI.
   */
  inlineConfig: InlineConfig<WebpackUserConfig>;

  /**
   * The original configuration options that were provided by the user to the Storm Stack process.
   */
  userConfig: ResolvedUserConfig<WebpackUserConfig>;

  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "webpack";
};

export type RspackResolvedOptions<
  TPluginsOptions extends Record<string, any> = Record<string, any>
> = BaseResolvedOptions<RspackUserConfig, TPluginsOptions> & {
  /**
   * The configuration options that were provided inline to the Storm Stack CLI.
   */
  inlineConfig: InlineConfig<RspackUserConfig>;

  /**
   * The original configuration options that were provided by the user to the Storm Stack process.
   */
  userConfig: ResolvedUserConfig<RspackUserConfig>;

  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "rspack";
};

export type ESBuildResolvedOptions<
  TPluginsOptions extends Record<string, any> = Record<string, any>
> = BaseResolvedOptions<ESBuildUserConfig, TPluginsOptions> & {
  /**
   * The configuration options that were provided inline to the Storm Stack CLI.
   */
  inlineConfig: InlineConfig<ESBuildUserConfig>;

  /**
   * The original configuration options that were provided by the user to the Storm Stack process.
   */
  userConfig: ResolvedUserConfig<ESBuildUserConfig>;

  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "esbuild";
};

export type RollupResolvedOptions<
  TPluginsOptions extends Record<string, any> = Record<string, any>
> = BaseResolvedOptions<RollupUserConfig, TPluginsOptions> & {
  /**
   * The configuration options that were provided inline to the Storm Stack CLI.
   */
  inlineConfig: InlineConfig<RollupUserConfig>;

  /**
   * The original configuration options that were provided by the user to the Storm Stack process.
   */
  userConfig: ResolvedUserConfig<RollupUserConfig>;

  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "rollup";
};

export type RolldownResolvedOptions<
  TPluginsOptions extends Record<string, any> = Record<string, any>
> = BaseResolvedOptions<RolldownUserConfig, TPluginsOptions> & {
  /**
   * The configuration options that were provided inline to the Storm Stack CLI.
   */
  inlineConfig: InlineConfig<RolldownUserConfig>;

  /**
   * The original configuration options that were provided by the user to the Storm Stack process.
   */
  userConfig: ResolvedUserConfig<RolldownUserConfig>;

  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "rolldown";
};

export type TsupResolvedOptions<
  TPluginsOptions extends Record<string, any> = Record<string, any>
> = BaseResolvedOptions<TsupUserConfig, TPluginsOptions> & {
  /**
   * The configuration options that were provided inline to the Storm Stack CLI.
   */
  inlineConfig: InlineConfig<TsupUserConfig>;

  /**
   * The original configuration options that were provided by the user to the Storm Stack process.
   */
  userConfig: ResolvedUserConfig<TsupUserConfig>;

  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "tsup";
};

export type UnbuildResolvedOptions<
  TPluginsOptions extends Record<string, any> = Record<string, any>
> = BaseResolvedOptions<UnbuildUserConfig, TPluginsOptions> & {
  /**
   * The configuration options that were provided inline to the Storm Stack CLI.
   */
  inlineConfig: InlineConfig<UnbuildUserConfig>;

  /**
   * The original configuration options that were provided by the user to the Storm Stack process.
   */
  userConfig: ResolvedUserConfig<UnbuildUserConfig>;

  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "unbuild";
};

export type StandaloneApplicationResolvedOptions<
  TPluginsOptions extends Record<string, any> = Record<string, any>
> = BaseResolvedOptions<StandaloneApplicationUserConfig, TPluginsOptions> & {
  /**
   * The configuration options that were provided inline to the Storm Stack CLI.
   */
  inlineConfig: InlineConfig<StandaloneApplicationUserConfig>;

  /**
   * The original configuration options that were provided by the user to the Storm Stack process.
   */
  userConfig: ResolvedUserConfig<StandaloneApplicationUserConfig>;

  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "standalone";

  /**
   * The type of project being built.
   */
  projectType: "application";
};

export type StandaloneLibraryResolvedOptions<
  TPluginsOptions extends Record<string, any> = Record<string, any>
> = BaseResolvedOptions<StandaloneLibraryUserConfig, TPluginsOptions> & {
  /**
   * The configuration options that were provided inline to the Storm Stack CLI.
   */
  inlineConfig: InlineConfig<StandaloneLibraryUserConfig>;

  /**
   * The original configuration options that were provided by the user to the Storm Stack process.
   */
  userConfig: ResolvedUserConfig<StandaloneLibraryUserConfig>;

  /**
   * The build variant being used by the Storm Stack engine.
   */
  variant: "standalone";

  /**
   * The type of project being built.
   */
  projectType: "library";
};

export type ResolvedOptions<
  TPluginsOptions extends Record<string, any> = Record<string, any>
> =
  | WebpackResolvedOptions<TPluginsOptions>
  | RspackResolvedOptions<TPluginsOptions>
  | ViteResolvedOptions<TPluginsOptions>
  | ESBuildResolvedOptions<TPluginsOptions>
  | UnbuildResolvedOptions<TPluginsOptions>
  | TsupResolvedOptions<TPluginsOptions>
  | RolldownResolvedOptions<TPluginsOptions>
  | RollupResolvedOptions<TPluginsOptions>
  | StandaloneApplicationResolvedOptions<TPluginsOptions>
  | StandaloneLibraryResolvedOptions<TPluginsOptions>;

export interface ViteConfigHookParams {
  config: ViteOptions;
  env: { mode: string; command: string };
}

export interface ViteConfigResolvedHookParams {
  config: ResolvedConfig;
}

export interface ViteConfigureServerHookParams {
  server: ViteDevServer;
}

export interface ViteConfigurePreviewServerHookParams {
  server: PreviewServer;
}

export interface ViteTransformIndexHtmlHookParams {
  html: string;
  ctx: IndexHtmlTransformContext;
  result?: IndexHtmlTransformResult | null;
}

export interface ViteHandleHotUpdateHookParams {
  ctx: HmrContext;
  result?: ModuleNode[] | null;
}

/**
 * The functions available for each Storm Stack plugin to hook into the engine.
 */
export interface EngineHookFunctions<TContext extends Context = Context> {
  // --- New - Hooks used during the creation of a new project ---

  "new:begin": (context: TContext) => MaybePromise<void>;
  "new:library": (context: TContext) => MaybePromise<void>;
  "new:application": (context: TContext) => MaybePromise<void>;
  "new:complete": (context: TContext) => MaybePromise<void>;

  // --- Init - Hooks used during the initialization of the Storm Stack engine ---

  "init:begin": (context: TContext) => MaybePromise<void>;
  "init:options": (context: TContext) => MaybePromise<void>;
  "init:install": (context: TContext) => MaybePromise<void>;
  "init:tsconfig": (context: TContext) => MaybePromise<void>;
  "init:entry": (context: TContext) => MaybePromise<void>;
  "init:reflections": (context: TContext) => MaybePromise<void>;
  "init:complete": (context: TContext) => MaybePromise<void>;

  // --- Clean - Hooks used during the cleaning of the Storm Stack project ---

  "clean:begin": (context: TContext) => MaybePromise<void>;
  "clean:output": (context: TContext) => MaybePromise<void>;
  "clean:docs": (context: TContext) => MaybePromise<void>;
  "clean:complete": (context: TContext) => MaybePromise<void>;

  // --- Prepare - Hooks used during the preparation of the Storm Stack artifacts ---

  "prepare:begin": (context: TContext) => MaybePromise<void>;
  "prepare:config": (context: TContext) => MaybePromise<void>;
  "prepare:builtins": (context: TContext) => MaybePromise<void>;
  "prepare:types": (
    context: TContext,
    sourceFile: SourceFile
  ) => MaybePromise<void>;
  "prepare:generate": (context: TContext) => MaybePromise<void>;
  "prepare:complete": (context: TContext) => MaybePromise<void>;

  // --- Lint - Hooks used during the linting process ---

  "lint:begin": (context: TContext) => MaybePromise<void>;
  "lint:types": (context: TContext) => MaybePromise<void>;
  "lint:eslint": (context: TContext) => MaybePromise<void>;
  "lint:complete": (context: TContext) => MaybePromise<void>;

  // --- Build - Hooks used during the build process of the Storm Stack project ---

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

  // --- Docs - Hooks used during the documentation generation process ---

  "docs:begin": (context: TContext) => MaybePromise<void>;
  "docs:api-reference": (context: TContext) => MaybePromise<void>;
  "docs:complete": (context: TContext) => MaybePromise<void>;

  // --- Finalize - Hooks used during the finalization of the Storm Stack project ---

  "finalize:begin": (context: TContext) => MaybePromise<void>;
  "finalize:complete": (context: TContext) => MaybePromise<void>;

  // --- Vite - Hooks used during the Vite process ---

  /**
   * A hook that allows modifying the Vite configuration before it is finalized.
   *
   * @see https://vitejs.dev/guide/api-plugin#config
   */
  "vite:config": (
    context: TContext,
    params: ViteConfigHookParams
  ) => MaybePromise<void>;

  /**
   * A hook that is called after the Vite configuration has been resolved.
   *
   * @see https://vitejs.dev/guide/api-plugin#configresolved
   */
  "vite:configResolved": (
    context: TContext,
    params: ViteConfigResolvedHookParams
  ) => MaybePromise<void>;

  /**
   * A hook that allows configuring the Vite development server.
   *
   * @see https://vitejs.dev/guide/api-plugin#configureserver
   */
  "vite:configureServer": (
    context: TContext,
    params: ViteConfigureServerHookParams
  ) => MaybePromise<void>;

  /**
   * A hook that allows configuring the Vite preview server.
   *
   * @see https://vitejs.dev/guide/api-plugin#configurepreviewserver
   */
  "vite:configurePreviewServer": (
    context: TContext,
    params: ViteConfigurePreviewServerHookParams
  ) => MaybePromise<void>;

  /**
   * A hook that allows transforming the `index.html` file during the Vite build process.
   *
   * @see https://vitejs.dev/guide/api-plugin#transformindexhtml
   */
  "vite:transformIndexHtml": (
    context: TContext,
    params: ViteTransformIndexHtmlHookParams
  ) => MaybePromise<void>;

  /**
   * A hook that allows handling hot module updates during the Vite development process.
   *
   * @see https://vitejs.dev/guide/api-plugin#handlehotupdate
   */
  "vite:handleHotUpdate": (
    context: TContext,
    params: ViteHandleHotUpdateHookParams
  ) => MaybePromise<void>;

  // --- ESBuild - Hooks used during the ESBuild process ---

  /**
   * A hook that is called when the ESBuild process is set up.
   *
   * @see https://esbuild.github.io/api/#build
   */
  "esbuild:setup": (
    context: TContext,
    params: { build: PluginBuild }
  ) => MaybePromise<void>;

  /**
   * A hook that allows modifying the ESBuild configuration before it is finalized.
   *
   * @see https://esbuild.github.io/api/#build
   */
  "esbuild:config": (context: TContext, options: BuildOptions) => void;

  /**
   * A hook that allows configuring the ESBuild development server.
   *
   * @see https://esbuild.github.io/api/#serve
   */
  "esbuild:configureServer": (
    context: TContext,
    params: { server: ViteDevServer }
  ) => MaybePromise<void>;

  /**
   * A hook that allows modifying the loading of files during the ESBuild process.
   *
   * @see https://esbuild.github.io/api/#loader
   */
  "esbuild:loader": (
    context: TContext,
    params: {
      code: string;
      id: string;
      result?: Loader;
    }
  ) => MaybePromise<void>;
}

export type EngineHooks<TContext extends Context = Context> = Hookable<
  EngineHookFunctions<TContext>
>;
