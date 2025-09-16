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

import { parseTypeDefinition } from "@stryke/convert/parse-type-definition";
import { listFiles } from "@stryke/fs/list-files";
import { hash } from "@stryke/hash/hash";
import { findFileExtension } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { replacePath } from "@stryke/path/replace";
import type {
  TypeDefinition,
  TypeDefinitionParameter
} from "@stryke/types/configuration";
import { ResolvedEntryTypeDefinition } from "../types/build";
import type { Context } from "../types/context";

export function resolveEntryInputFile(
  context: Context,
  typeDefinition: TypeDefinition
): string {
  return replacePath(
    typeDefinition.file,
    joinPaths(context.options.workspaceRoot, context.options.projectRoot)
  );
}

export function resolveEntryInput(
  context: Context,
  typeDefinition: TypeDefinition
): TypeDefinition {
  return {
    file: resolveEntryInputFile(context, typeDefinition),
    name: typeDefinition.name
  };
}

export function resolveEntryOutput(
  context: Context,
  typeDefinition: TypeDefinition
): string {
  return joinPaths(
    context.options.output.outputPath,
    "dist",
    replacePath(
      replacePath(
        typeDefinition.file,
        joinPaths(context.options.workspaceRoot, context.options.sourceRoot)
      ),
      joinPaths(context.options.workspaceRoot, context.options.projectRoot)
    )
  ).replace(findFileExtension(typeDefinition.file) || "", "");
}

export function resolveEntry(
  context: Context,
  typeDefinition: TypeDefinition
): ResolvedEntryTypeDefinition {
  const input = resolveEntryInput(context, typeDefinition);

  return {
    ...input,
    input,
    output: resolveEntryOutput(context, typeDefinition)
  };
}

export async function resolveEntries(
  context: Context,
  typeDefinitions: TypeDefinitionParameter[]
): Promise<ResolvedEntryTypeDefinition[]> {
  return (
    await Promise.all(
      typeDefinitions.map(async typeDefinition => {
        const parsed = parseTypeDefinition(typeDefinition)!;

        return (await listFiles(parsed.file)).map(file =>
          resolveEntry(context, {
            file,
            name: parsed.name
          })
        );
      })
    )
  )
    .flat()
    .filter(Boolean);
}

export function resolveVirtualEntry(
  context: Context,
  typeDefinition: TypeDefinitionParameter
): ResolvedEntryTypeDefinition {
  const parsed = parseTypeDefinition(typeDefinition)!;
  const resolved = resolveEntry(context, parsed);
  const file = joinPaths(
    context.artifactsPath,
    `entry-${hash({ file: resolved.file, name: resolved.name }, { maxLength: 24 }).replaceAll("-", "0").replaceAll("_", "1")}.ts`
  );

  return {
    file,
    name: resolved.name,
    input: {
      file,
      name: resolved.name
    },
    output: file
  };
}
