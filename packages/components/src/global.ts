import type { config } from "./tamagui.config";

type Config = typeof config;

// this will give you types for your components
// note - if using your own design system, put the package name here instead of tamagui
declare module "@storm-stack/components" {
  interface TamaguiCustomConfig extends Config {}

  // if you want types for group styling props, define them like so:
  /*interface TypeOverride {
    groupNames(): "a" | "b" | "c";
  }*/
}

export default config;
