export type DesignTokenGroupKind =
  | "color-scheme"
  | "color-scheme-background"
  | "color-palette";
export const DesignTokenGroupKind = {
  COLOR_SCHEME: "color-scheme" as DesignTokenGroupKind,
  COLOR_SCHEME_BACKGROUND: "color-scheme-background" as DesignTokenGroupKind,
  COLOR_PALETTE: "color-palette" as DesignTokenGroupKind
};

export type DesignTokenTypes =
  | "color"
  | "size"
  | "spacing"
  | "fontFamilies"
  | "typography"
  | "border"
  | "radius"
  | "shadow"
  | "transition";
export const DesignTokenTypes = {
  COLOR: "color" as DesignTokenTypes,
  SIZE: "size" as DesignTokenTypes,
  SPACING: "spacing" as DesignTokenTypes,
  FONT_FAMILIES: "fontFamilies" as DesignTokenTypes,
  TYPOGRAPHY: "typography" as DesignTokenTypes,
  BORDER: "border" as DesignTokenTypes,
  RADIUS: "radius" as DesignTokenTypes,
  SHADOW: "shadow" as DesignTokenTypes,
  TRANSITION: "transition" as DesignTokenTypes
};

export interface DesignTokenGroup {
  $kind?: DesignTokenGroupKind;
  description?: string;
}

export interface DesignToken {
  type?: DesignTokenTypes;
  description?: string;
}

export interface ColorToken extends DesignToken {
  type: "color";
  value: string;
}

export type ColorPaletteGroup = DesignTokenGroup &
  Record<string, ColorToken> & {
    $kind: "color-palette";
  };

export type ColorSchemeBackgroundGroup = {
  $kind: "color-scheme-background";
  "0"?: ColorToken;
  value?: string;
};

export interface ColorSchemeGroup extends DesignTokenGroup {
  $kind: "color-scheme";
}
