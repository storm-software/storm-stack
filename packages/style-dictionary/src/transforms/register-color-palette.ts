import type StyleDictionary from "style-dictionary";
import {
  type ColorSchemeBackgroundGroup,
  DesignTokenGroupKind
} from "../types";

export const registerColorPaletteTransforms = (sd: typeof StyleDictionary) => {
  sd.registerTransform({
    name: "storm/transform/color-palette",
    type: "attribute",
    matcher: token =>
      token.$type === DesignTokenGroupKind.COLOR_SCHEME &&
      token.type === DesignTokenGroupKind.COLOR_SCHEME,
    transformer: token => {
      const background = Object.values(token.value).find(
        (child: any) =>
          child?.$type === DesignTokenGroupKind.COLOR_SCHEME_BACKGROUND &&
          child?.type === DesignTokenGroupKind.COLOR_SCHEME_BACKGROUND
      ) as ColorSchemeBackgroundGroup | undefined;
      if (!background || (!background.value && !background["0"]?.value)) {
        return token;
      }
      background;

      const palettes = Object.values(token.value).filter(
        (child: any) =>
          child?.$type === DesignTokenGroupKind.COLOR_PALETTE &&
          child?.type === DesignTokenGroupKind.COLOR_PALETTE
      );

      return {
        ...token,
        ...palettes?.map((palette: any) => {
          return {
            comment: `The ${token.name} ${palette.name} color palette used by the theme`,
            "0": {
              value: background.value ?? background["0"]?.value,
              type: "color"
            },
            ...palette
          };
        })
      };
    }
  });
};
