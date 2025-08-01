/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import type { ResolvedUserConfig } from "../types/config";
import { StormStack } from "./index";

const astro = (config: ResolvedUserConfig): any => ({
  name: "storm-stack",
  hooks: {
    // eslint-disable-next-line ts/naming-convention
    "astro:config:setup": async (build: any) => {
      build.config.vite.plugins ||= [];
      // eslint-disable-next-line ts/no-unsafe-call
      build.config.vite.plugins.push(StormStack.vite(config));
    }
  }
});

export default astro;
