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

import type { Arrayable, Awaitable } from "@antfu/utils";
import type { FilterPattern } from "@rollup/pluginutils";
import type { PresetOptions } from "@storm-software/eslint";
import { Linter } from "eslint";
import type {
  AddonVueDirectivesOptions,
  Import,
  InlinePreset,
  PackagePreset,
  UnimportOptions
} from "unimport";
import { PresetName } from "./presets";

export interface ImportLegacy {
  /**
   * @deprecated renamed to `as`
   */
  name?: string;
  /**
   * @deprecated renamed to `name`
   */
  importName?: string;
  /**
   * @deprecated renamed to `from`
   */
  path: string;

  sideEffects?: SideEffectsInfo;
}

export interface ImportExtended extends Import {
  sideEffects?: SideEffectsInfo;
  __source?: "dir" | "resolver";
}

export type ImportNameAlias = [string, string];
export type SideEffectsInfo = Arrayable<ResolverResult | string> | undefined;

export interface ResolverResult {
  as?: string;
  name?: string;
  from: string;
}

export type ResolverFunction = (
  name: string
) => Awaitable<
  string | ResolverResult | ImportExtended | null | undefined | void
>;

export interface ResolverResultObject {
  type: "component" | "directive";
  resolve: ResolverFunction;
}

/**
 * Given a identifier name, returns the import path or an import object
 */
export type Resolver = ResolverFunction | ResolverResultObject;

/**
 * module, name, alias
 */
export type ImportsMap = Record<string, (string | ImportNameAlias)[]>;

export interface ScanDirExportsOptions {
  /**
   * Register type exports
   *
   * @defaultValue true
   */
  types?: boolean;
}

/**
 * Directory to search for import
 */
export interface ScanDir {
  glob: string;
  types?: boolean;
}

export type NormalizedScanDir = Required<ScanDir>;

export type ESLintGlobalsPropValue =
  | boolean
  | "readonly"
  | "readable"
  | "writable"
  | "writeable";

export interface ESLint {
  /**
   * @defaultValue false
   */
  enabled?: boolean | "eslint-flat" | "eslintrc";
  /**
   * Filepath to save the generated eslintrc config
   *
   * @defaultValue './.eslintrc-storm-stack.json'
   */
  eslintrcFilepath?: string;
  /**
   * Filepath to save the generated eslint flat config
   *
   * @defaultValue './eslint-storm-stack.config.js'
   */
  eslintFlatFilepath?: string;
  /**
   * @defaultValue true
   */
  globalsPropValue?: ESLintGlobalsPropValue;
  /**
   * The options to pass to the `@storm-software/eslint` preset
   *
   * @remarks
   * This value is only used when `enabled` is set to `true` or `eslint-flat`
   */
  presetOptions?: Omit<PresetOptions, "name"> &
    Partial<Pick<PresetOptions, "name">>;
  /**
   * Custom ESLint config to pass to the `@storm-software/eslint` preset
   *
   * @remarks
   * This value is only used when `enabled` is set to `true` or `eslint-flat`
   */
  userConfigs?: Linter.Config[];
}

export interface BiomeLintrc {
  /**
   * @defaultValue false
   */
  enabled?: boolean;
  /**
   * Filepath to save the generated eslint config
   *
   * @defaultValue './.eslintrc-storm-stack.json'
   */
  filepath?: string;
}

export interface Options {
  /**
   * Preset names or custom imports map
   *
   * @defaultValue []
   */
  imports?: Arrayable<ImportsMap | PresetName | InlinePreset>;

  /**
   * Local package presets.
   *
   * Register local installed packages as a preset.
   *
   * @defaultValue []
   * @see https://github.com/unplugin/unplugin-auto-import#package-presets
   */
  packagePresets?: (PackagePreset | string)[];

  /**
   * Identifiers to be ignored
   */
  ignore?: (string | RegExp)[];

  /**
   * These identifiers won't be put on the DTS file
   */
  ignoreDts?: (string | RegExp)[];

  /**
   * Inject the imports at the end of other imports
   *
   * @defaultValue true
   */
  injectAtEnd?: boolean;

  /**
   * Options for scanning directories for auto import
   */
  dirsScanOptions?: ScanDirExportsOptions;

  /**
   * Path for directories to be auto imported
   */
  dirs?: (string | ScanDir)[];

  /**
   * Pass a custom function to resolve the component importing path from the component name.
   *
   * The component names are always in PascalCase
   */
  resolvers?: Arrayable<Arrayable<Resolver>>;

  /**
   * Parser to be used for parsing the source code.
   *
   * @see https://github.com/unjs/unimport#acorn-parser
   * @defaultValue 'regex'
   */
  parser?: UnimportOptions["parser"];

  /**
   * Filepath to generate corresponding .d.ts file.
   * Default enabled when `typescript` is installed locally.
   * Set `false` to disable.
   *
   * @defaultValue './storm-stack.d.ts'
   */
  dts?: string | boolean;

  /**
   * Auto import inside Vue templates
   *
   * @see https://github.com/unjs/unimport/pull/15
   * @see https://github.com/unjs/unimport/pull/72
   * @defaultValue false
   */
  vueTemplate?: boolean;

  /**
   * Enable auto import directives for Vue's SFC.
   *
   * Library authors should include `meta.vueDirective: true` in the import metadata.
   *
   * When using a local directives folder, provide the `isDirective`
   * callback to check if the import is a Vue directive.
   *
   * @see https://github.com/unjs/unimport?tab=readme-ov-file#vue-directives-auto-import-and-typescript-declaration-generation
   */
  vueDirectives?: true | AddonVueDirectivesOptions;

  /**
   * Set default export alias by file name
   *
   * @defaultValue false
   */
  defaultExportByFilename?: boolean;

  /**
   * Rules to include transforming target.
   *
   * @defaultValue [/\.[jt]sx?$/, /\.astro$/, /\.vue$/, /\.vue\?vue/, /\.svelte$/]
   */
  include?: FilterPattern;

  /**
   * Rules to exclude transforming target.
   *
   * @defaultValue [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/]
   */
  exclude?: FilterPattern;

  /**
   * Generate corresponding eslint-storm-stack.config.js and/or .eslintrc-storm-stack.json file.
   */
  eslint?: ESLint;

  /**
   * Generate corresponding .biomelintrc-storm-stack.json file.
   */
  biomelintrc?: BiomeLintrc;

  /**
   * Save unimport items into a JSON file for other tools to consume.
   * Provide a filepath to save the JSON file.
   *
   * When set to `true`, it will save to `./.unimport-items.json`
   *
   * @defaultValue false
   */
  dumpUnimportItems?: boolean | string;

  /**
   * Include auto-imported packages in Vite's `optimizeDeps` option
   *
   * @defaultValue true
   */
  viteOptimizeDeps?: boolean;
}

export type { PresetName } from "./presets";
