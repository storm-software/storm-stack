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

import ts from "typescript";
import { TranspilerOptions } from "../../types/compiler";
import { Context } from "../../types/context";
import {
  createDeclarationTransformer,
  createTransformer
} from "../deepkit/transformer";

/**
 * Transpile TypeScript code using the provided context and options.
 *
 * @param context - The base context containing TypeScript configuration and options.
 * @param id - The identifier for the TypeScript file being transpiled.
 * @param code - The TypeScript code to be transpiled.
 * @returns The transpiled output.
 */
export function transpile(
  context: Context,
  id: string,
  code: string,
  options: TranspilerOptions = {}
): ts.TranspileOutput {
  const transformer = createTransformer(context, options);
  const declarationTransformer = createDeclarationTransformer(context, options);

  return ts.transpileModule(code, {
    compilerOptions: {
      ...context.tsconfig.options
    },
    fileName: id,
    transformers: {
      before: [transformer],
      after: [declarationTransformer]
    }
  });
}
