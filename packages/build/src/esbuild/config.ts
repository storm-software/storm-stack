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

import * as esbuild from "esbuild";

export type BuildResult = esbuild.BuildResult;
export type BuildOptions = esbuild.BuildOptions & {
  name?: string;
  emitTypes?: boolean;
  emitMetafile?: boolean;
  outbase?: never; // we don't support this
};

export const DEFAULT_BUILD_OPTIONS = {
  platform: "node",
  target: "ES2021",
  logLevel: "error",
  tsconfig: "tsconfig.build.json",
  metafile: true
} as const;

export const adapterConfig: BuildOptions[] = [
  {
    name: "cjs",
    format: "cjs",
    bundle: true,
    entryPoints: ["src/index.ts"],
    outfile: "dist/index",
    outExtension: { ".js": ".js" },
    emitTypes: true
  },
  {
    name: "esm",
    format: "esm",
    bundle: true,
    entryPoints: ["src/index.ts"],
    outfile: "dist/index",
    outExtension: { ".js": ".mjs" },
    emitTypes: true
  }
];
