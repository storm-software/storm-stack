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

/* eslint-disable ts/no-unsafe-call */

import Diff from "diff-match-patch";
import type MagicString from "magic-string";
import type { CompilerResult } from "../../types/compiler";

const dmp = new Diff();

/**
 * Generate code with source map.
 *
 * @param id - The file name.
 * @param source - The source code.
 * @param transpiled - The transpiled code.
 * @returns The compiler result.
 */
export function generateSourceMap(
  id: string,
  source: MagicString,
  transpiled?: string
): CompilerResult {
  if (!transpiled) {
    return;
  }

  const diff = dmp.diff_main(source.toString(), transpiled);
  dmp.diff_cleanupSemantic(diff);

  let offset = 0;

  for (let index = 0; index < diff.length; index++) {
    if (diff[index]) {
      const [type, text] = diff[index]!;
      const textLength = text.length;

      switch (type) {
        case 0: {
          offset += textLength;
          break;
        }
        case 1: {
          source.prependLeft(offset, text);
          break;
        }
        case -1: {
          const next = diff.at(index + 1);

          if (next && next[0] === 1) {
            const replaceText = next[1];

            const firstNonWhitespaceIndexOfText = text.search(/\S/);
            const offsetStart =
              offset + Math.max(firstNonWhitespaceIndexOfText, 0);

            source.update(offsetStart, offset + textLength, replaceText);
            index += 1;
          } else {
            source.remove(offset, offset + textLength);
          }

          offset += textLength;

          break;
        }
      }
    }
  }

  if (!source.hasChanged()) {
    return;
  }

  return {
    code: source.toString(),
    map: source.generateMap({
      source: id,
      file: `${id}.map`,
      includeContent: true
    })
  };
}
