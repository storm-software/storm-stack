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

import * as DeepkitCompiler from "@deepkit/type-compiler";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import { readFile } from "@stryke/fs/read-file";
import type { OnLoadArgs, OnLoadResult, Plugin } from "esbuild";
import { Context } from "../../types/context";
import { RESOLVE_NAMESPACE } from "./constants";

const loader = new DeepkitCompiler.DeepkitLoader();

export const deepkitPlugin = (context: Context): Plugin => {
  return {
    name: "storm-stack:deepkit",
    setup(build) {
      build.onLoad(
        { filter: /.tsx?$/ },
        async (args: OnLoadArgs): Promise<OnLoadResult | null | undefined> => {
          let contents: string;

          try {
            contents = await readFile(args.path);
            // If already reflected do nothing
            if (args.pluginData?.isReflected) {
              return {
                contents,
                // loader: "ts",
                pluginData: {
                  ...(args.pluginData || {}),
                  [RESOLVE_NAMESPACE]: {
                    isReflected: true
                  }
                }
              };
            }

            contents = loader.transform(contents, args.path);
          } catch (error) {
            context.log(
              LogLevelLabel.ERROR,
              `Deepkit reflection error for file "${args.path}": ${error instanceof Error ? error.message : String(error)}`
            );
            return null;
          }

          return {
            contents,
            // loader: "ts",
            pluginData: {
              ...(args.pluginData || {}),
              [RESOLVE_NAMESPACE]: {
                isReflected: true
              }
            }
          };
        }
      );
    }
  };
};
