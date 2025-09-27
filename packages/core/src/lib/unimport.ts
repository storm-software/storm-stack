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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { existsSync } from "@stryke/fs/exists";
import { createDirectory } from "@stryke/fs/helpers";
import { throttle } from "@stryke/helpers/throttle";
import { StormJSON } from "@stryke/json/storm-json";
import { findFilePath } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { isSetString } from "@stryke/type-checks/is-set-string";
import {
  createUnimport as createUnimportExternal,
  InlinePreset,
  Preset
} from "unimport";
import type { SourceFile } from "../types/compiler";
import { Context, UnimportContext } from "../types/context";
import { parseAst } from "./babel/ast";
import { listExports } from "./babel/helpers";
import { writeFile } from "./utilities/write-file";

let lastImportsDump: string | undefined;

const DEFAULT_UNIMPORT_CONFIG = {
  commentsDisable: [
    "@unimport-disable",
    "@imports-disable",
    "@storm-disable",
    "@storm-ignore"
  ],
  commentsDebug: ["@unimport-debug", "@imports-debug", "@storm-debug"],
  injectAtEnd: true
};

export function createUnimport(context: Context): UnimportContext {
  context.log(
    LogLevelLabel.TRACE,
    "Creating Unimport context with Storm Stack presets"
  );

  let unimport = createUnimportExternal({
    ...DEFAULT_UNIMPORT_CONFIG,
    presets: [] as Preset[]
    // parser: "acorn"
  });

  async function refreshRuntimeImports() {
    const presets = [] as Preset[];
    for (const id of context.vfs.builtinIdMap.keys()) {
      const contents = await context.vfs.readFile(id);
      if (contents) {
        context.log(
          LogLevelLabel.TRACE,
          `Processing exports from runtime file: ${id}`
        );

        const importNames = listExports(parseAst(contents)).filter(
          (importName: string) =>
            !presets.some(
              preset =>
                (preset as InlinePreset)?.imports &&
                !(preset as InlinePreset)?.imports.some(
                  presetImport =>
                    (isSetString(presetImport) &&
                      presetImport === importName) ||
                    (Array.isArray(presetImport) &&
                      presetImport[0] === importName)
                )
            )
        );
        if (importNames.length > 0) {
          presets.push({
            imports: importNames,
            from: id
          });
        }
      }
    }

    unimport = createUnimportExternal({
      ...DEFAULT_UNIMPORT_CONFIG,
      presets,
      virtualImports: Array.from(context.vfs.builtinIdMap.keys())
    });
    await unimport.init();
  }

  async function dumpImports() {
    context.log(LogLevelLabel.TRACE, "Dumping import file...");

    const items = await unimport.getImports();
    const importDumpFile = joinPaths(context.dataPath, "imports-dump.json");
    if (!existsSync(findFilePath(importDumpFile))) {
      await createDirectory(findFilePath(importDumpFile));
    }

    context.log(
      LogLevelLabel.TRACE,
      `Writing imports-dump JSON file: ${importDumpFile}`
    );

    const content = StormJSON.stringify(items);
    if (content.trim() !== lastImportsDump?.trim()) {
      lastImportsDump = content;
      await writeFile(context.log, importDumpFile, content);
    }
  }

  const dumpImportsThrottled = throttle(dumpImports, 500);

  async function injectImports(source: SourceFile) {
    const result = await unimport.injectImports(source.code, source.id);

    if (!source.code.hasChanged()) {
      return source;
    }

    await dumpImportsThrottled();

    // return {
    //   s: source.code,
    //   imports: [],
    //   code: source.code.toString(),
    //   map: source.code.generateMap({
    //     source: source.id,
    //     includeContent: true,
    //     hires: true
    //   })
    // };

    return {
      ...source,
      code: result.s
    };
  }

  return {
    ...unimport,
    dumpImports: dumpImportsThrottled,
    injectImports,
    refreshRuntimeImports
  };
}
