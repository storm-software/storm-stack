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
import { listFiles } from "@stryke/fs/list-files";
import { readFile } from "@stryke/fs/read-file";
import { findFileName } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { resolvePackage } from "@stryke/path/resolve";
import ts from "typescript";
import { LogFn } from "../../types/config";
import { createMemoryProgram, SourcesMap } from "./program";

async function loadLibFiles(): Promise<SourcesMap> {
  const libLocation = await resolvePackage("typescript");
  const libFiles = await listFiles(
    joinPaths(libLocation!, "lib", "**", "lib.*.d.ts")
  );

  const lib: SourcesMap = new Map();
  for (const file of libFiles) {
    lib.set(
      `/node_modules/typescript/lib/${findFileName(file)}`,
      await readFile(joinPaths(libLocation!, "lib", file))
    );
  }

  return lib;
}

export async function typeCheck(
  log: LogFn,
  sources: SourcesMap
): Promise<void> {
  const program = createMemoryProgram(
    sources,
    undefined,
    {
      noEmit: true,
      lib: ["lib.esnext.d.ts"],
      types: []
    },
    await loadLibFiles()
  );

  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      log(
        LogLevelLabel.ERROR,
        `${diagnostic.file.fileName}:${line + 1}:${character + 1} : ${message}`
      );
    } else {
      log(
        LogLevelLabel.ERROR,
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      );
    }
  });
}
