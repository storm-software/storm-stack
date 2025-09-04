/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import astro from "./astro";
import esbuild from "./esbuild";
import nuxt from "./nuxt";
import rolldown from "./rolldown";
import rollup from "./rollup";
import rspack from "./rspack";
import vite from "./vite";
import webpack from "./webpack";

export * from "./core";

export const plugin = {
  astro,
  esbuild,
  nuxt,
  rolldown,
  rollup,
  rspack,
  vite,
  webpack
};

export default plugin;
