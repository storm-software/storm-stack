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

import alloyPlugin from "@alloy-js/rollup-plugin";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { globSync } from "glob";
import path from "node:path";
import { fileURLToPath } from "node:url";
import typescriptPlugin from "rollup-plugin-typescript2";

const externals = [
  "@storm-stack/core",
  "@storm-software/",
  "@stryke/",
  "@alloy-js/",
  "@babel/",
  "picocolors",
  "chalk",
  "cli-table3",
  "defu",
  "pathe",
  "yaml",
  "prettier",
  "prettier/doc.js",
  "fs",
  "fs/promises",
  "v8",
  "module"
];

/** @type {import('rollup').Config[]} */
export default [
  {
    jsx: "preserve",
    external: id =>
      externals.includes(id) || externals.some(ext => id.startsWith(ext)),
    input: Object.fromEntries(
      globSync("src/**/{*.tsx,*.ts}").map(file => [
        file.slice(0, file.length - path.extname(file).length),
        fileURLToPath(new URL(file, import.meta.url))
      ])
    ),
    output: {
      dir: "dist",
      format: "es",
      preserveModules: true,
      entryFileNames: "[name].js"
    },
    plugins: [
      typescriptPlugin({
        check: false,
        tsconfig: "./tsconfig.json"
      }),
      alloyPlugin(),
      resolve({
        moduleDirectories: ["node_modules"],
        preferBuiltins: true
      })
    ]
  },
  {
    jsx: "preserve",
    external: id =>
      externals.includes(id) || externals.some(ext => id.startsWith(ext)),
    input: Object.fromEntries(
      globSync("src/**/{*.tsx,*.ts}").map(file => [
        file.slice(0, file.length - path.extname(file).length),
        fileURLToPath(new URL(file, import.meta.url))
      ])
    ),
    output: {
      dir: "dist",
      format: "cjs",
      preserveModules: true,
      entryFileNames: "[name].cjs"
    },
    plugins: [
      typescriptPlugin({
        check: false,
        tsconfig: "./tsconfig.json"
      }),
      alloyPlugin(),
      resolve({
        moduleDirectories: ["node_modules"],
        preferBuiltins: true
      }),
      commonjs()
    ]
  }
];
