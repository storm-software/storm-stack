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
  Type,
  TypeNumber,
  TypeString
} from "@storm-stack/core/deepkit/type";
import { getUniqueBy } from "@stryke/helpers/get-unique";
import { StormJSON } from "@stryke/json/storm-json";
import { isNull } from "@stryke/type-checks/is-null";
import { isString } from "@stryke/type-checks/is-string";
import { isUndefined } from "@stryke/type-checks/is-undefined";

/**
 * Converts any {@link ReflectionProperty} or {@link ReflectionParameter}'s value to string representation.
 *
 * @param property - The {@link ReflectionProperty} or {@link ReflectionParameter} containing the value to stringify.
 * @param value - The value to stringify.
 * @returns A string representation of the value.
 */
export function stringifyDefaultValue(
  property: ReflectionProperty | ReflectionParameter,
  value?: any
): string {
  return stringifyValue(property.type, value ?? property.getDefaultValue());
}

/**
 * Stringifies a value as a string.
 *
 * @param value - The value to stringify.
 * @returns A string representation of the value.
 */
export function stringifyStringValue(value?: any): string {
  return `"${String(value).replaceAll('"', '\\"')}"`;
}

/**
 * Converts any {@link Type}'s actual value to string representation.
 *
 * @param type - The {@link Type} of the value to stringify.
 * @param value - The value to stringify.
 * @returns A string representation of the value.
 */
export function stringifyValue(type: Type, value: any): string {
  return isUndefined(value)
    ? "undefined"
    : isNull(value)
      ? "null"
      : type.kind === ReflectionKind.boolean
        ? String(value).trim().toLowerCase() === "true"
          ? "true"
          : "false"
        : type.kind === ReflectionKind.string ||
            (type.kind === ReflectionKind.literal && isString(type.literal))
          ? stringifyStringValue(value)
          : type.kind === ReflectionKind.enum
            ? getEnumReflectionType(type).kind === ReflectionKind.string
              ? stringifyStringValue(value)
              : `${String(value)}`
            : type.kind === ReflectionKind.union
              ? isStringUnion(type)
                ? stringifyStringValue(value)
                : `${String(value)}`
              : type.kind === ReflectionKind.array
                ? stringifyStringValue(StormJSON.stringify(value))
                : type.kind === ReflectionKind.object ||
                    type.kind === ReflectionKind.objectLiteral
                  ? StormJSON.stringify(value)
                  : type.kind === ReflectionKind.property ||
                      type.kind === ReflectionKind.parameter
                    ? stringifyValue(type.type, value)
                    : String(value);
}

/**
 * Converts a {@link TypeEnum} to its underlying primitive type representation.
 *
 * @param type - The {@link TypeEnum} to evaluate.
 * @returns A string representation of the primitive type.
 */
export function getEnumReflectionType(type: Type): TypeString | TypeNumber {
  if (type.kind !== ReflectionKind.enum) {
    throw new Error(`Expected a TypeEnum, but received ${type.kind}.`);
  }

  const unique = getUniqueBy(
    type.values.filter(value => value !== undefined && value !== null),
    enumMember =>
      isString(enumMember)
        ? {
            kind: ReflectionKind.string
          }
        : {
            kind: ReflectionKind.number
          }
  );
  if (unique.length === 0) {
    throw new Error(`No valid enum members could be found.`);
  }

  return unique[0] && isString(unique[0])
    ? {
        kind: ReflectionKind.string
      }
    : {
        kind: ReflectionKind.number
      };
}

/**
 * Converts a {@link TypeUnion} to its underlying primitive type representation.
 *
 * @param type - The {@link TypeUnion} to evaluate.
 * @returns A string representation of the primitive type.
 */
export function getUnionTypes(type: Type): Type[] {
  if (type.kind === ReflectionKind.union && type.types.length > 0) {
    return getUniqueBy(type.types, member => member.kind);
  }

  throw new Error(`Expected a TypeUnion, but received ${type.kind}.`);
}

export function isStringUnion(type: Type): boolean {
  return getUnionTypes(type).some(
    member =>
      member.kind === ReflectionKind.string ||
      (member.kind === ReflectionKind.literal && isString(member.literal))
  );
}

/**
 * Converts a ReflectionKind to its string representation.
 *
 * @param kind - The {@link ReflectionKind} to convert.
 * @returns A string representation of the kind.
 */
export function kindToName(kind: ReflectionKind): string {
  if (kind === ReflectionKind.void) {
    return "void";
  } else if (kind === ReflectionKind.never) {
    return "never";
  } else if (kind === ReflectionKind.null) {
    return "null";
  } else if (kind === ReflectionKind.undefined) {
    return "undefined";
  } else if (kind === ReflectionKind.symbol) {
    return "symbol";
  } else if (kind === ReflectionKind.bigint) {
    return "bigint";
  } else if (kind === ReflectionKind.number) {
    return "number";
  } else if (kind === ReflectionKind.string) {
    return "string";
  } else if (kind === ReflectionKind.boolean) {
    return "boolean";
  } else if (kind === ReflectionKind.literal) {
    return "literal";
  } else if (kind === ReflectionKind.class) {
    return "class";
  } else if (kind === ReflectionKind.array) {
    return "array";
  } else if (kind === ReflectionKind.object) {
    return "object";
  } else if (kind === ReflectionKind.objectLiteral) {
    return "objectLiteral";
  } else if (kind === ReflectionKind.union) {
    return "union";
  } else if (kind === ReflectionKind.enum) {
    return "enum";
  } else if (kind === ReflectionKind.regexp) {
    return "regexp";
  } else if (kind === ReflectionKind.templateLiteral) {
    return "templateLiteral";
  } else if (kind === ReflectionKind.property) {
    return "property";
  } else if (kind === ReflectionKind.method) {
    return "method";
  } else if (kind === ReflectionKind.function) {
    return "function";
  } else if (kind === ReflectionKind.parameter) {
    return "parameter";
  } else if (kind === ReflectionKind.promise) {
    return "promise";
  } else if (kind === ReflectionKind.typeParameter) {
    return "typeParameter";
  } else if (kind === ReflectionKind.tuple) {
    return "tuple";
  } else if (kind === ReflectionKind.tupleMember) {
    return "tupleMember";
  } else if (kind === ReflectionKind.enumMember) {
    return "enumMember";
  } else if (kind === ReflectionKind.rest) {
    return "rest";
  } else if (kind === ReflectionKind.indexSignature) {
    return "indexSignature";
  } else if (kind === ReflectionKind.propertySignature) {
    return "propertySignature";
  } else if (kind === ReflectionKind.methodSignature) {
    return "methodSignature";
  } else if (kind === ReflectionKind.infer) {
    return "infer";
  } else if (kind === ReflectionKind.callSignature) {
    return "callSignature";
  } else if (kind === ReflectionKind.any) {
    return "any";
  } else if (kind === ReflectionKind.intersection) {
    return "intersection";
  }

  return "unknown";
}
