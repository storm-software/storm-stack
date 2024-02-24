import { registerTransforms } from "@tokens-studio/sd-transforms";
import type StyleDictionary from "style-dictionary";

export const registerTokensStudioTransforms = (sd: typeof StyleDictionary) => {
  registerTransforms(sd as any);
};
