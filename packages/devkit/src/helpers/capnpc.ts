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
  ReflectionKind,
  ReflectionParameter,
  ReflectionProperty,
  Type
} from "@storm-stack/core/deepkit";
import { getUnionTypes } from "@storm-stack/core/lib/deepkit/utilities";
import { Context } from "@storm-stack/core/types";
import { capnpc } from "@stryke/capnp/compile";
import { resolveOptions } from "@stryke/capnp/helpers";
import type { CapnpcOptions, CapnpcResult } from "@stryke/capnp/types";
import { toArray } from "@stryke/convert/to-array";
import { getUniqueBy } from "@stryke/helpers/get-unique";
import { StormJSON } from "@stryke/json/storm-json";
import { joinPaths } from "@stryke/path/join-paths";
import { camelCase } from "@stryke/string-format/camel-case";
import { isNull } from "@stryke/type-checks/is-null";
import { isString } from "@stryke/type-checks/is-string";
import { isUndefined } from "@stryke/type-checks/is-undefined";
import defu from "defu";

/**
 * Compiles a Cap'n Proto schema into TypeScript definitions.
 *
 * @param context - The context containing the project and workspace information.
 * @param options - The options for compiling the schema.
 * @returns A promise that resolves to the compiled schema.
 */
export async function compile(
  context: Context,
  options: Partial<CapnpcOptions> = {}
): Promise<CapnpcResult> {
  const opts = defu(options, {
    ts: true,
    js: false,
    dts: false,
    schemas: joinPaths(context.artifactsPath, "schemas"),
    tsconfig: context.tsconfig,
    projectRoot: context.options.projectRoot,
    workspaceRoot: context.options.workspaceRoot,
    tty: true
  }) as CapnpcOptions;

  const resolvedOptions = await resolveOptions(opts);
  if (!resolvedOptions) {
    throw new Error(
      `✖ No Cap'n Proto schema files found in the specified source paths: ${toArray(
        opts.schemas
      ).join(", ")}.`
    );
  }

  return capnpc(resolvedOptions);
}

/**
 * Converts any {@link ReflectionProperty} or {@link ReflectionParameter}'s value to string representation.
 *
 * @param property - The {@link ReflectionProperty} or {@link ReflectionParameter} containing the value to stringify.
 * @param value - The value to stringify.
 * @returns A string representation of the value.
 */
export function stringifyCapnpDefaultValue(
  property: ReflectionProperty | ReflectionParameter,
  value?: any
): string {
  return stringifyCapnpValue(
    property.type,
    value ?? property.getDefaultValue()
  );
}

/**
 * Converts any {@link Type}'s actual value to string representation.
 *
 * @param type - The {@link Type} of the value to stringify.
 * @param value - The value to stringify.
 * @returns A string representation of the value.
 */
export function stringifyCapnpValue(type: Type, value: any): string {
  return type.kind === ReflectionKind.string ||
    (type.kind === ReflectionKind.literal && isString(type.literal))
    ? `"${String(value)}"`
    : type.kind === ReflectionKind.enum
      ? `${camelCase(String(value))}`
      : type.kind === ReflectionKind.array
        ? StormJSON.stringify(value)
        : type.kind === ReflectionKind.object ||
            type.kind === ReflectionKind.objectLiteral
          ? StormJSON.stringify(value).replaceAll("{", "(").replaceAll("}", ")")
          : String(value);
}

/**
 * Converts a ReflectionProperty's default value to a Cap'n Proto schema string representation.
 *
 * @param type - The TypeEnum to evaluate.
 * @returns A string representation of the property.
 */
export function getCapnpEnumTypes(type: Type): "Text" | "Float32" | null {
  if (type.kind !== ReflectionKind.enum) {
    return null;
  }

  const unique = getUniqueBy(
    type.values.filter(value => !isUndefined(value) && !isNull(value)),
    enumMember => (isString(enumMember) ? "Text" : "Float32")
  );
  if (unique.length === 0) {
    return null;
  }

  return unique[0] && isString(unique[0]) ? "Text" : "Float32";
}

/**
 * Determines if a Type is a `Void` type in a Cap'n Proto schema.
 *
 * @param type - The Type to check.
 * @returns True if the Type is a `Void` type, false otherwise.
 */
export function isVoidType(type: Type): boolean {
  return (
    type.kind === ReflectionKind.void ||
    type.kind === ReflectionKind.never ||
    type.kind === ReflectionKind.null ||
    type.kind === ReflectionKind.undefined ||
    type.kind === ReflectionKind.symbol
  );
}

/**
 * Converts a {@link TypeUnion} to an array of its underlying Cap'n Proto primitive type representation.
 *
 * @param type - The {@link TypeUnion} to convert.
 * @returns A string representation of the Cap'n Proto primitive type.
 */
export function getCapnpUnionTypes(type: Type): Type[] {
  return getUnionTypes(type);
}

/**
 * Converts a {@link TypeUnion} to an array of its underlying Cap'n Proto primitive type representation.
 *
 * @param type - The {@link TypeUnion} to convert.
 * @returns An array of Cap'n Proto primitive types.
 */
export function isCapnpStringUnion(type: Type): boolean {
  return getCapnpUnionTypes(type).some(
    member => member.kind === ReflectionKind.string
  );
}
