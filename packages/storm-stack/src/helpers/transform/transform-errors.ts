/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

import { Lang, parseAsync } from "@ast-grep/napi";
import { readJsonFile } from "@stryke/fs/read-file";
import { writeJsonFile } from "@stryke/fs/write-file";
import { isEqual } from "@stryke/helpers/is-equal";
import { joinPaths } from "@stryke/path/join-paths";
import { existsSync } from "node:fs";
import type { Context, Options, SourceFile } from "../../types/build";
import { ErrorType } from "../../types/global";

function getLatestErrorCode(
  type: string = ErrorType.GENERAL,
  errorCodes = {} as Record<ErrorType, Record<string, string>>
): number {
  if (!errorCodes[type]) {
    return 1;
  }
  const keys = Object.keys(errorCodes[type]);
  if (keys.length === 0) {
    return 1;
  }

  const errorCodeNum = Number.parseInt(keys.sort()[0]!);
  if (Number.isNaN(errorCodeNum)) {
    return 1;
  }

  return errorCodeNum + 1;
}

export async function transformErrors<TOptions extends Options = Options>(
  source: SourceFile,
  context: Context<TOptions>
): Promise<SourceFile> {
  if (!context.workspaceConfig.error.codesFile) {
    return source;
  }

  let errorCodes = {} as Record<ErrorType, Record<string, string>>;
  if (
    existsSync(
      joinPaths(
        context.workspaceConfig.workspaceRoot,
        context.workspaceConfig.error.codesFile
      )
    )
  ) {
    errorCodes = await readJsonFile(
      joinPaths(
        context.workspaceConfig.workspaceRoot,
        context.workspaceConfig.error.codesFile
      )
    );
  }

  const originalErrorCodes = { ...errorCodes };

  const ast = await parseAsync(Lang.TypeScript, source.code.toString());
  const root = ast.root();

  const nodes = root.findAll({
    rule: {
      kind: "new_expression",
      any: [
        { pattern: "new Error($$$ARGS)" },
        { pattern: "new StormError($$$ARGS)" }
      ]
    }
  });
  if (!nodes) {
    return source;
  }

  nodes.forEach(node => {
    const args = node.getMatch("ARGS");
    const firstArg = args?.child(0);
    if (firstArg?.kind() === "string") {
      const value = firstArg.text();
      const type = args?.child(1)?.text() ?? ErrorType.GENERAL;

      const existing = Object.entries(errorCodes[type]).find(
        ([, errorMessage]) => errorMessage === value
      );
      if (existing) {
        source.code = source.code.replaceAll(
          node.text(),
          `new StormError({ type: "${type}", code: ${existing[0]} })`
        );
      } else {
        const errorCode = getLatestErrorCode(type, errorCodes);

        errorCodes[type] ??= {};
        errorCodes[type][String(errorCode)] = value;

        source.code = source.code.replaceAll(
          node.text(),
          `new StormError({ type: "${type}", code: ${errorCode} })`
        );
      }
    }
  });

  if (!isEqual(originalErrorCodes, errorCodes)) {
    await writeJsonFile(
      joinPaths(
        context.workspaceConfig.workspaceRoot,
        context.workspaceConfig.error.codesFile
      ),
      errorCodes
    );
  }

  return source;
}
