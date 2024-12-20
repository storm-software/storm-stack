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

import typia, { tags } from "typia";

/**
 * The light background color of the workspace
 */
type BackgroundColor = string &
  tags.Default<"f4f4f5"> &
  tags.Pattern<"/^#([da-f]{3}){1,2}$/i"> &
  tags.MinLength<7> &
  tags.MaxLength<7>;

/**
 * The primary brand specific color of the workspace
 */
type BrandColor = string &
  tags.Default<"1fb2a6"> &
  tags.Pattern<"/^#([da-f]{3}){1,2}$/i"> &
  tags.MinLength<7> &
  tags.MaxLength<7>;

/**
 * The alternate brand specific color of the workspace
 */
type AlternateColor = (string | undefined) &
  tags.Pattern<"/^#([da-f]{3}){1,2}$/i"> &
  tags.MinLength<7> &
  tags.MaxLength<7>;

/**
 * The secondary brand specific color of the workspace
 */
type AccentColor = (string | undefined) &
  tags.Pattern<"/^#([da-f]{3}){1,2}$/i"> &
  tags.MinLength<7> &
  tags.MaxLength<7>;

/**
 * The color used to display hyperlink text
 */
type LinkColor = (string | undefined) &
  tags.Pattern<"/^#([da-f]{3}){1,2}$/i"> &
  tags.MinLength<7> &
  tags.MaxLength<7>;

/**
 * The second brand specific color of the workspace
 */
type HelpColor = string &
  tags.Default<"8256D0"> &
  tags.Pattern<"/^#([da-f]{3}){1,2}$/i"> &
  tags.MinLength<7> &
  tags.MaxLength<7>;

/**
 * The success color of the workspace
 */
type SuccessColor = string &
  tags.Default<"12B66A"> &
  tags.Pattern<"/^#([da-f]{3}){1,2}$/i"> &
  tags.MinLength<7> &
  tags.MaxLength<7>;

/**
 * The informational color of the workspace
 */
type InfoColor = string &
  tags.Default<"0070E0"> &
  tags.Pattern<"/^#([da-f]{3}){1,2}$/i"> &
  tags.MinLength<7> &
  tags.MaxLength<7>;

/**
 * The warning color of the workspace
 */
type WarningColor = string &
  tags.Default<"fcc419"> &
  tags.Pattern<"/^#([da-f]{3}){1,2}$/i"> &
  tags.MinLength<7> &
  tags.MaxLength<7>;

/**
 * The danger color of the workspace
 */
type DangerColor = string &
  tags.Default<"D8314A"> &
  tags.Pattern<"/^#([da-f]{3}){1,2}$/i"> &
  tags.MinLength<7> &
  tags.MaxLength<7>;

/**
 * The fatal color of the workspace
 */
type FatalColor = (string | undefined) &
  tags.Pattern<"/^#([da-f]{3}){1,2}$/i"> &
  tags.MinLength<7> &
  tags.MaxLength<7>;

/**
 * The positive number color of the workspace
 */
type PositiveColor = string &
  tags.Default<"4ade80"> &
  tags.Pattern<"/^#([da-f]{3}){1,2}$/i"> &
  tags.MinLength<7> &
  tags.MaxLength<7>;

/**
 * The negative number color of the workspace
 */
type NegativeColor = string &
  tags.Default<"ef4444"> &
  tags.Pattern<"/^#([da-f]{3}){1,2}$/i"> &
  tags.MinLength<7> &
  tags.MaxLength<7>;

type DarkThemeColors = {
  foreground: BackgroundColor;
  background: BrandColor;
  brand: BrandColor;
  alternate: AlternateColor;
  accent: AccentColor;
  link: LinkColor;
  help: HelpColor;
  success: SuccessColor;
  info: InfoColor;
  warning: WarningColor;
  danger: DangerColor;
  fatal: FatalColor;
  positive: PositiveColor;
  negative: NegativeColor;
};

type LightThemeColors = {
  foreground: BackgroundColor;
  background: BrandColor;
  brand: BrandColor;
  alternate: AlternateColor;
  accent: AccentColor;
  link: LinkColor;
  help: HelpColor;
  success: SuccessColor;
  info: InfoColor;
  warning: WarningColor;
  danger: DangerColor;
  fatal: FatalColor;
  positive: PositiveColor;
  negative: NegativeColor;
};

type MultiThemeColors = {
  dark: DarkThemeColors;
  light: LightThemeColors;
};

type SingleThemeColors = {
  dark: BackgroundColor;
  light: BrandColor;
  brand: BrandColor;
  alternate: AlternateColor;
  accent: AccentColor;
  link: LinkColor;
  help: HelpColor;
  success: SuccessColor;
  info: InfoColor;
  warning: WarningColor;
  danger: DangerColor;
  fatal: FatalColor;
  positive: PositiveColor;
  negative: NegativeColor;
};

/**
 * Storm theme color config values used for styling various workspace elements
 */
type ColorConfig = SingleThemeColors | MultiThemeColors;

type ColorConfigMap =
  | {
      base: ColorConfig;
    }
  | Record<string, ColorConfig>;

/**
 * Storm Workspace config values used during various dev-ops processes. It represents the config of the entire monorepo.
 */
export type WorkspaceConfig = {
  $schema: string &
    tags.Default<"https://cdn.jsdelivr.net/npm/@storm-software/config/schemas/storm.schema.json">;
  extends: string | undefined;
  isRoot: boolean & tags.Default<false>;
  name: string | undefined;
  namespace: string | undefined;
  organization: string & tags.Default<"storm-software">;
  repository: (string | undefined) & tags.Pattern<"^https?://.+">;
  license: string & tags.Default<"Apache-2.0">;
  homepage: string &
    tags.Default<"https://stormsoftware.com"> &
    tags.Pattern<"^https?://.+">;
  docs: string &
    tags.Default<"https://stormsoftware.com/projects/storm-stack/docs"> &
    tags.Pattern<"^https?://.+">;
  licensing: string &
    tags.Default<"https://stormsoftware.com/projects/storm-stack/license"> &
    tags.Pattern<"^https?://.+">;
  branch: string & tags.Default<"main">;
  preid: string | undefined;
  owner: string & tags.Default<"@storm-software/admin">;
  worker: string & tags.Default<"Stormie-Bot">;
  envName: ("development" | "staging" | "production") &
    tags.Default<"production">;
  workspaceRoot: string & tags.Default<"">;
  packageDirectory: string | undefined;
  externalPackagePatterns: string[];
  skipCache: boolean & tags.Default<false>;
  cacheDirectory: string | undefined;
  dataDirectory: string | undefined;
  configDirectory: string | undefined;
  tempDirectory: string | undefined;
  logDirectory: string | undefined;
  buildDirectory: string & tags.Default<"dist">;
  outputDirectory: string & tags.Default<"node_modules/.storm">;
  runtimeVersion: string &
    tags.Default<"1.0.0"> &
    tags.Pattern<"^(0|[1-9]d*).(0|[1-9]d*).(0|[1-9]d*)(?:-((?:0|[1-9]d*|d*[A-Za-z-][dA-Za-z-]*)(?:.(?:0|[1-9]d*|d*[A-Za-z-][dA-Za-z-]*))*))?(?:+([dA-Za-z-]+(?:.[dA-Za-z-]+)*))?$">;
  packageManager: ("npm" | "yarn" | "pnpm" | "bun") & tags.Default<"npm">;
  timezone: string & tags.Default<"America/New_York">;
  locale: string & tags.Default<"en-US">;
  logLevel: (
    | "silent"
    | "fatal"
    | "error"
    | "warn"
    | "info"
    | "debug"
    | "trace"
    | "all"
  ) &
    tags.Default<"info">;
  cloudflareAccountId: (string | undefined) & tags.Pattern<"^[da-f]{32}$">;
  registry: {
    github: (string | undefined) & tags.Pattern<"^https?://.+">;
    npm: (string | undefined) & tags.Pattern<"^https?://.+">;
    cargo: (string | undefined) & tags.Pattern<"^https?://.+">;
    cyclone: (string | undefined) & tags.Pattern<"^https?://.+">;
    container: (string | undefined) & tags.Pattern<"^https?://.+">;
  };
  configFile: string | undefined;
  colors: ColorConfig | ColorConfigMap;
  extensions: Record<string, any> | undefined;
};

export const WorkspaceConfigSchema = typia.json.schemas<
  [WorkspaceConfig],
  "3.0"
>();
