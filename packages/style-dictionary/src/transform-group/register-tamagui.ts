import type StyleDictionary from "style-dictionary";

export const registerTamaguiTransformGroup = (sd: typeof StyleDictionary) => {
  sd.registerTransformGroup({
    name: "storm/tamagui",
    transforms: [
      "storm/transform/color-palette",
      "name/cti/snake",
      "ts/descriptionToComment",
      "ts/size/px",
      "ts/opacity",
      "ts/size/lineheight",
      "ts/typography/fontWeight",
      "ts/resolveMath",
      "ts/size/css/letterspacing",
      "ts/typography/css/fontFamily",
      "ts/typography/css/shorthand",
      "ts/border/css/shorthand",
      "ts/shadow/css/shorthand",
      "ts/color/css/hexrgba",
      "ts/color/modifiers"
    ]
  });
};
