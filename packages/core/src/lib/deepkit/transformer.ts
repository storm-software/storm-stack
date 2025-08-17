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

import {
  Cache,
  DeclarationTransformer,
  ReflectionTransformer
} from "@deepkit/type-compiler";
import ts from "typescript";
import { TranspilerOptions } from "../../types/compiler";
import { Context } from "../../types/context";

let loaded = false;
const cache = new Cache();

export function createTransformer(
  context: Context,
  options: TranspilerOptions = {}
): ts.CustomTransformerFactory {
  return function transformer(ctx: ts.TransformationContext) {
    if (!loaded) {
      loaded = true;
    }

    cache.tick();
    return new ReflectionTransformer(ctx, cache).withReflection({
      reflection: options.reflectionMode || "default",
      reflectionLevel:
        options.reflectionLevel ||
        context.tsconfig.tsconfigJson.compilerOptions?.reflectionLevel ||
        context.tsconfig.tsconfigJson.reflectionLevel ||
        "minimal"
    });
  };
}

export function createDeclarationTransformer(
  context: Context,
  options: TranspilerOptions = {}
): ts.CustomTransformerFactory {
  return function declarationTransformer(ctx: ts.TransformationContext) {
    return new DeclarationTransformer(ctx, cache).withReflection({
      reflection: options.reflectionMode || "default",
      reflectionLevel:
        options.reflectionLevel ||
        context.tsconfig.tsconfigJson.compilerOptions?.reflectionLevel ||
        context.tsconfig.tsconfigJson.reflectionLevel ||
        "minimal"
    });
  };
}
