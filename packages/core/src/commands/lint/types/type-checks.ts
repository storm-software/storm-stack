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
import ts from "typescript";
import {
  createVirtualProgram,
  SourcesMap
} from "../../../lib/typescript/program";
import { Context } from "../../../types/context";

/**
 * Perform type checks on the provided sources using TypeScript's compiler API.
 *
 * @param context - The build context containing information about the current build.
 * @param sources - The source files to check.
 */
export async function checkTypes(
  context: Context,
  sources?: SourcesMap
): Promise<void> {
  if (sources) {
    await Promise.all(
      sources
        .entries()
        .map(async ([path, content]) => context.vfs.writeFile(path, content))
    );
  }

  const program = await createVirtualProgram(
    sources ? Array.from(sources.keys()) : [],
    context,
    {
      noEmit: true,
      lib: ["lib.esnext.d.ts"],
      types: []
    }
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
      context.log(
        LogLevelLabel.ERROR,
        `${diagnostic.file.fileName}:${line + 1}:${character + 1} : ${message}`
      );
    } else {
      context.log(
        LogLevelLabel.ERROR,
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      );
    }
  });
}
