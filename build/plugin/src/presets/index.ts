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

import { builtinPresets } from "unimport";
import { jotai, jotaiUtils } from "./jotai";
import react from "./react";
import reactI18next from "./react-i18next";
import reactRouter from "./react-router";
import reactRouterDom from "./react-router-dom";
import stormStack from "./storm-stack";
import vitepress from "./vitepress";

export const presets = {
  ...builtinPresets,
  react: react,
  "react-router": reactRouter,
  "react-router-dom": reactRouterDom,
  "react-i18next": reactI18next,
  "storm-stack": stormStack,
  vitepress: vitepress,
  jotai: jotai,
  "jotai/utils": jotaiUtils
};

export type PresetName = keyof typeof presets;
