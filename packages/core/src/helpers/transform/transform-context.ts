/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { generateCode, parseModule } from "magicast";
import type { SourceFile } from "../../types/build";
import { getMagicString, getString } from "../utilities/magic-string";

export function transformContext(source: SourceFile): SourceFile {
  if (getString(source.code).includes("$storm")) {
    source.code = getMagicString(
      getString(source.code).replaceAll("$storm", "useStorm()")
    );

    const ast = parseModule(source.code.toString());
    ast.imports.$append({
      imported: "useStorm",
      from: "storm:context"
    });

    const { code } = generateCode(ast);
    source.code = getMagicString(code);
  }

  return source;
}
