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

import { joinPathFragments } from "@nx/devkit";
import {
  type BuildOptions,
  outExtension
} from "@storm-software/workspace-tools";
import type { BuildOptions as EsBuildOptions } from "esbuild";
import { aliasPlugin } from "./plugins/alias-plugin";
import { createExternalPlugin } from "./plugins/external-plugin";

export type GetTamaguiConfigParams = any & {
  clientPlatform: "native" | "web";
};

export function getTamaguiConfig({
  entry,
  outDir,
  projectRoot,
  workspaceRoot,
  tsconfig = "tsconfig.json",
  splitting,
  treeshake,
  format = ["cjs", "esm"],
  debug = false,
  shims = true,
  external,
  banner = {},
  clientPlatform = "web",
  verbose = false,
  apiReport = true,
  docModel = true,
  tsdocMetadata = true,
  metafile = true,
  skipNativeModulesPlugin = false,
  env,
  plugins,
  bundle,
  generatePackageJson,
  dtsTsConfig,
  minify = false,
  getTransform
}: any): BuildOptions {
  const externalPlugin = createExternalPlugin({
    skipNodeModulesBundle: true
  });

  const result = {
    name: `${clientPlatform}-components`,
    entry,
    format,
    target: clientPlatform === "native" ? "node16" : "esnext",
    tsconfig,
    splitting,
    generatePackageJson,
    treeshake: treeshake
      ? {
          preset: "recommended"
        }
      : false,
    projectRoot,
    workspaceRoot,
    outDir: joinPathFragments(outDir, "dist"),
    silent: !verbose,
    metafile,
    shims,
    external,
    platform: clientPlatform === "native" || bundle ? "node" : "neutral",
    banner,
    env,
    dts: false,
    experimentalDts: {
      entry,
      compilerOptions: {
        ...dtsTsConfig,
        options: {
          ...dtsTsConfig.options,
          outDir: joinPathFragments(outDir, "dist")
        }
      }
    },

    apiReport,
    docModel,
    tsdocMetadata,
    sourcemap: debug,
    sourcesContent: false,
    clean: false,
    allowOverwrite: true,
    keepNames: true,
    skipNativeModulesPlugin,
    tsconfigDecoratorMetadata: true,
    plugins,
    esbuildOptions: (
      options: EsBuildOptions,
      _context: {
        format: "cjs" | "esm" | "iife";
      }
    ) => {
      options.jsx = "automatic";
      if (clientPlatform === "native") {
        options.supported = {
          "logical-assignment": false
        };
      } else {
        options.resolveExtensions = [
          ".native.ts",
          ".native.tsx",
          ".native.js",
          ".ts",
          ".tsx",
          ".js",
          ".jsx"
        ];
        options.tsconfigRaw = {
          compilerOptions: {
            paths: {
              "react-native": ["react-native-web"]
            }
          }
        };
      }
    },
    define: {
      ...(clientPlatform && {
        "process.env.TAMAGUI_TARGET": `"${clientPlatform}"`,
        "process.env.TAMAGUI_IS_CORE_NODE": '"1"'
      })
    },

    getTransform,
    outExtension
  } as BuildOptions;

  result.esbuildPlugins ??= [];
  result.esbuildPlugins.push(externalPlugin);
  if (clientPlatform === "native") {
    result.esbuildPlugins.push(
      aliasPlugin({
        "@tamagui/web": require.resolve("@tamagui/web/native"),

        // for test mode we want real react-native
        "react-native": require.resolve("@tamagui/fake-react-native"),
        "react-native/Libraries/Renderer/shims/ReactFabric": require.resolve(
          "@tamagui/fake-react-native"
        ),
        "react-native/Libraries/Renderer/shims/ReactNative": require.resolve(
          "@tamagui/fake-react-native"
        ),
        "react-native/Libraries/Pressability/Pressability": require.resolve(
          "@tamagui/fake-react-native"
        ),

        "react-native/Libraries/Pressability/usePressability": require.resolve(
          "@tamagui/fake-react-native/idFn"
        ),

        "react-native-safe-area-context": require.resolve(
          "@tamagui/fake-react-native"
        ),
        "react-native-gesture-handler": require.resolve("@tamagui/proxy-worm")
      })
    );
  }

  if (!debug || minify) {
    result.minify = "terser";
    result.terserOptions = {
      compress: true,
      ecma: 2020,
      keep_classnames: true,
      keep_fnames: true
    };
  }

  return result;
}
