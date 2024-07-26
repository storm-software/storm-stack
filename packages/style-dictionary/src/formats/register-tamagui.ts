import { EMPTY_STRING, NEWLINE_STRING } from "@storm-stack/utilities";
import type StyleDictionary from "style-dictionary";
import {
  type ColorPaletteGroup,
  DesignTokenGroupKind,
  DesignTokenTypes
} from "../types";

export const registerTamaguiFormat = (sd: typeof StyleDictionary) => {
  sd.registerFormat({
    name: "storm/tamagui/color-palettes",
    formatter: ({ dictionary }) =>
      `export const ColorPalettes = { ${dictionary.allTokens
        .filter(
          token =>
            token?.$type === DesignTokenGroupKind.COLOR_PALETTE &&
            token?.type === DesignTokenGroupKind.COLOR_PALETTE
        )
        .map(token => {
          const palettes = Object.values(token.value).filter(
            (child: any) =>
              child?.$type === DesignTokenGroupKind.COLOR_PALETTE &&
              child?.type === DesignTokenGroupKind.COLOR_PALETTE
          ) as ColorPaletteGroup[];

          return palettes
            .map(
              palette =>
                `${palette.name}: [ ${Object.keys(palette)
                  .filter(key => palette[key]?.type === DesignTokenTypes.COLOR)
                  .sort()
                  .map(key => palette[key]?.value ?? EMPTY_STRING)
                  .join(", ")} ]`
            )
            .join(`,${NEWLINE_STRING}`);
        })
        .join("\n")};`
  });
};
