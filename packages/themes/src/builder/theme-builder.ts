import { createThemeBuilder as _createThemeBuilder } from "@tamagui/theme-builder";

export const createThemeBuilder = () => {
  const themesBuilder = _createThemeBuilder()
    .addPalettes({
      dark: ["#000", "#111", "#222", "#999", "#ccc", "#eee", "#fff"],
      light: ["#fff", "#eee", "#ccc", "#999", "#222", "#111", "#000"]
    })
    .addTemplates({
      base: {
        background: 0,
        color: -0
      }
    })
    // .addMasks({
    //   soften: CreateMask()
    // })
    .addThemes({
      light: {
        template: "base",
        palette: "light"
      },
      dark: {
        template: "base",
        palette: "dark"
      }
    })
    .addChildThemes({
      subtle: {
        mask: "soften"
      }
    });

  return themesBuilder;
};
