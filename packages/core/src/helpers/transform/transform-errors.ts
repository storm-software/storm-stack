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

import { Lang, parseAsync } from "@ast-grep/napi";
import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { ErrorType } from "@storm-stack/types/error";
import { readJsonFile } from "@stryke/fs/read-file";
import { deepClone } from "@stryke/helpers/deep-clone";
import { isEqual } from "@stryke/helpers/is-equal";
import { Mutex } from "@stryke/helpers/mutex";
import { StormJSON } from "@stryke/json/storm-json";
import { joinPaths } from "@stryke/path/join-paths";
import defu from "defu";
import { existsSync } from "node:fs";
import type { Context, Options, SourceFile } from "../../types/build";
import type { LogFn } from "../../types/config";
import { writeFile } from "../utilities/write-file";

const mutex = new Mutex();

function getLatestErrorCode(
  type = "general",
  errorCodes = {} as Record<ErrorType, Record<string, string>>
): string {
  if (!errorCodes[type]) {
    return "1";
  }
  const keys = Object.keys(errorCodes[type]);
  if (keys.length === 0) {
    return "1";
  }

  const errorCode = Number.parseInt(
    keys.sort((a, b) => b.localeCompare(a))[0]!
  );
  if (Number.isNaN(errorCode)) {
    return "1";
  }

  return String(errorCode + 1);
}

export async function transformErrors<TOptions extends Options = Options>(
  log: LogFn,
  source: SourceFile,
  context: Context<TOptions>
): Promise<SourceFile> {
  const errorCodesFilePath = joinPaths(
    context.workspaceConfig.workspaceRoot,
    context.options.errorsFile!
  );
  let errorCodes = {} as Record<ErrorType, Record<string, string>>;

  if (!existsSync(errorCodesFilePath)) {
    log(
      LogLevelLabel.WARN,
      `No error codes file path exists. Writing empty file.`
    );
    await writeFile(log, errorCodesFilePath, StormJSON.stringify({}));
  } else {
    errorCodes = await readJsonFile(errorCodesFilePath);
  }

  const originalErrorCodes = deepClone(errorCodes);

  const ast = await parseAsync(Lang.TypeScript, source.code.toString());
  const root = ast.root();

  const nodes = root.findAll({
    rule: {
      kind: "new_expression",
      any: [
        { pattern: "new Error($$$ARGS)" },
        { pattern: "new TypeError($$$ARGS)" },
        { pattern: "new ReferenceError($$$ARGS)" },
        { pattern: "new SyntaxError($$$ARGS)" },
        { pattern: "new RangeError($$$ARGS)" },
        { pattern: "new EvalError($$$ARGS)" },
        { pattern: "new URIError($$$ARGS)" },
        { pattern: "new AggregateError($$$ARGS)" },
        { pattern: "new InternalError($$$ARGS)" },
        { pattern: "new SystemError($$$ARGS)" },
        { pattern: "new NotImplementedError($$$ARGS)" },
        { pattern: "new StormError($$$ARGS)" }
      ]
    }
  });
  if (!nodes || nodes.length === 0) {
    log(
      LogLevelLabel.TRACE,
      `No error messages require transformation in ${source.id}.`
    );

    return source;
  }

  for (const node of nodes) {
    const args = node
      .getMultipleMatches("ARGS")
      .filter(
        arg => arg.kind() === "string" || arg.kind() === "template_string"
      );
    if (args.length >= 1 && args[0]) {
      let message = "";
      const params = [] as string[];

      if (args[0].kind() === "string") {
        message = args[0].text().slice(1, -1);
      } else if (args[0].kind() === "template_string") {
        for (const node of args[0].children()) {
          if (node.kind() === "string_fragment") {
            message += node.text();
          } else if (node.kind() === "template_substitution") {
            const param = node.text().slice(2, -1);
            if (param) {
              params.push(param);
              message += "%s";
            }
          }
        }
      }

      if (message) {
        let type: ErrorType = "general";
        if (args.length > 1 && args[1]) {
          const text = args[1].text();
          if (text) {
            type = text as ErrorType;
          }
        }

        errorCodes[type] ??= {};
        let code = Object.keys(errorCodes[type] ?? {}).find(
          key => errorCodes[type]?.[key] === message
        );
        if (!code) {
          code = getLatestErrorCode(type, errorCodes);

          log(
            LogLevelLabel.INFO,
            `Found unlisted error message "${message}" in ${source.id}. Assigning it to "${type}" code #${code}.`
          );

          errorCodes[type] ??= {};
          errorCodes[type]![code] = message;
        }

        source.code = source.code.replaceAll(
          node.text(),
          `new StormError({ type: "${type}", code: ${code}${params.length > 0 ? ` params: [${params.join(", ")}] ` : ""} })`
        );
      }
    }
  }

  if (!isEqual(originalErrorCodes, errorCodes)) {
    log(
      LogLevelLabel.INFO,
      `Adding error messages from ${source.id} to ${context.options.errorsFile}.`
    );

    await mutex.acquire();
    try {
      await writeFile(
        log,
        errorCodesFilePath,
        StormJSON.stringify(
          defu(errorCodes, await readJsonFile(errorCodesFilePath))
        )
      );
    } finally {
      mutex.release();
    }
  }

  return source;
}
