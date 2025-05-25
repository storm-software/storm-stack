/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { createDirectory } from "@stryke/fs/helpers";
import { throttle } from "@stryke/helpers/throttle";
import { StormJSON } from "@stryke/json/storm-json";
import { existsSync, findFilePath, joinPaths } from "@stryke/path/index";
import { createUnimport as createUnimportExt } from "unimport";
import { writeFile } from "../../helpers/utilities/write-file";
import type {
  Context,
  Options,
  SourceFile,
  UnimportContext
} from "../../types/build";
import type { LogFn } from "../../types/config";

let lastImportsDump: string | undefined;

export function createUnimport<TOptions extends Options = Options>(
  log: LogFn,
  context: Context<TOptions>
): UnimportContext {
  log(
    LogLevelLabel.TRACE,
    "Creating Unimport context with Storm Stack presets"
  );

  const unimport = createUnimportExt({
    commentsDisable: [
      "@unimport-disable",
      "@imports-disable",
      "@storm-disable",
      "@storm-ignore"
    ],
    commentsDebug: ["@unimport-debug", "@imports-debug", "@storm-debug"],
    injectAtEnd: true,
    presets: context.unimportPresets
    // parser: "acorn"
  });

  async function dumpImports() {
    log(LogLevelLabel.TRACE, "Dumping import file...");

    const items = await unimport.getImports();
    const importDumpFile = joinPaths(
      context.options.projectRoot,
      context.artifactsDir,
      "imports-dump.json"
    );
    if (!existsSync(findFilePath(importDumpFile))) {
      await createDirectory(findFilePath(importDumpFile));
    }

    log(
      LogLevelLabel.TRACE,
      `Writing imports-dump JSON file: ${importDumpFile}`
    );

    const content = StormJSON.stringify(items);
    if (content.trim() !== lastImportsDump?.trim()) {
      lastImportsDump = content;
      await writeFile(log, importDumpFile, content);
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
    injectImports
  };
}
