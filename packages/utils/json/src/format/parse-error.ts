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

import type { ParseError } from "jsonc-parser";
import { printParseErrorCode } from "jsonc-parser";
import { LinesAndColumns } from "lines-and-columns";
import { codeFrameColumns } from "./code-frames";

/**
 * Nicely formats a JSON error with context
 *
 * @param input - JSON content as string
 * @param parseError - jsonc ParseError
 * @returns
 */
export function formatParseError(input: string, parseError: ParseError) {
  const { error, offset, length } = parseError;
  let result = new LinesAndColumns(input).locationForIndex(offset);
  let line = result?.line ?? 0;
  let column = result?.column ?? 0;

  line++;
  column++;

  return (
    `${printParseErrorCode(error)} in JSON at ${line}:${column}\n` +
    codeFrameColumns(input, {
      start: { line, column },
      end: { line, column: column + length }
    }) +
    "\n"
  );
}
