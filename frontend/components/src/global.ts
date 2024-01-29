import type { CreateTamaguiProps } from "tamagui";
import { config } from "./tamagui.config";

export type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends CreateTamaguiProps {}
}

export default config;
