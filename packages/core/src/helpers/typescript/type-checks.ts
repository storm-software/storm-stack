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
import ts from "typescript";
import { LogFn } from "../../types/config";
import { createMemoryProgram, loadLibFiles, SourcesMap } from "./program";

export async function typeChecks(
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
