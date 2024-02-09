import { createInterFont } from "@tamagui/font-inter";
import { createMedia } from "@tamagui/react-native-media-driver";
import { shorthands } from "@tamagui/shorthands";
import { tokens as baseTokens } from "@tamagui/themes";
import { createTamagui, createTokens } from "tamagui";

const headingFont = createInterFont({
  size: {
    6: 15
  },
  transform: {
    6: "uppercase",
    7: "none"
  },
  weight: {
    6: "400",
    7: "700"
  },
  color: {
    6: "$colorFocus",
    7: "$color"
  },
  letterSpacing: {
    5: 2,
    6: 1,
    7: 0,
    8: -1,
    9: -2,
    10: -3,
    12: -4,
    14: -5,
    15: -6
  },
  face: {
    700: { normal: "InterBold" }
  }
} as const);

const bodyFont = createInterFont(
  {
    face: {
      700: { normal: "InterBold" }
    }
  } as const,
  {
    sizeSize: (size: number) => Math.round(size * 1.1),
    sizeLineHeight: (size: number) => Math.round(size * 1.1 + (size > 20 ? 10 : 10))
  }
);

// Set up our tokens

// The keys can be whatever you want, but we do recommend keeping them
// consistent across the different token categories and intended for
// usage together to make nice designs - eg for a Button to use.

export const tokens = createTokens({
  ...baseTokens,
  color: {
    white: "#fff",
    black: "#000"
  } as const
});

export const config = createTamagui({
  defaultFont: "body",
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    body: bodyFont,
    heading: headingFont
  },
  tokens,
  // For more on themes, see the Themes page
  themes: {
    light: {
      bg: "#f2f2f2",
      color: tokens.color.black
    },
    dark: {
      bg: "#111",
      color: tokens.color.white
    }
  } as const,

  // For web-only, media queries work out of the box and you can avoid the
  // `createMedia` call here by passing the media object directly.
  // If you are going to target React Native, use `createMedia` (it's an identity
  // function on web so you can import it there without concern).
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: "none" },
    pointerCoarse: { pointer: "coarse" }
  } as const)
});
