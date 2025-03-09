/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

import type { Options } from "../types";
import { StormStack } from "./index";

const astro = (options: Options): any => ({
  name: "storm-stack",
  hooks: {
    "astro:config:setup": async (build: any) => {
      build.config.vite.plugins ||= [];
      // eslint-disable-next-line ts/no-unsafe-call
      build.config.vite.plugins.push(StormStack.vite(options));
    }
  }
});

export default astro;
