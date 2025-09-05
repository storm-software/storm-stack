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

import { getClassName } from "@storm-stack/core/deepkit/core";
import {
  memberNameToString,
  ReflectionClass,
  ReflectionKind,
  ReflectionMethod,
  ReflectionProperty,
  Type,
  TypeEnum,
  TypeLiteral,
  TypeUnion
} from "@storm-stack/core/deepkit/type";
import { kindToName } from "@storm-stack/core/lib/deepkit/utilities";
import { getBaseFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import { Context } from "@storm-stack/core/types";
import { camelCase } from "@stryke/string-format/camel-case";
import { getWords } from "@stryke/string-format/get-words";
import { pascalCase } from "@stryke/string-format/pascal-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isBigInt } from "@stryke/type-checks/is-bigint";
import { isNumber } from "@stryke/type-checks/is-number";
import { isString } from "@stryke/type-checks/is-string";
import { Buffer } from "node:buffer";
import { exec } from "node:child_process";
import util from "node:util";
import {
  getCapnpEnumTypes,
  getCapnpUnionTypes,
  isVoidType,
  stringifyCapnpDefaultValue
} from "../../helpers/capnpc";

export const LARGE_BUFFER = 1024 * 1000000;
export type IOType = "overlapped" | "pipe" | "ignore" | "inherit";
export type StdioOptions =
  | IOType
  | Array<IOType | "ipc" | number | null | undefined>;

const execAsync = util.promisify(exec);

export async function generateCapnpId() {
  const { stdout } = await execAsync("capnp id", {
    windowsHide: true,
    maxBuffer: LARGE_BUFFER,
    killSignal: "SIGTERM"
  });

  return stdout;
}

export interface GenerateCapnpOptions {
  name?: string;
}

export async function generateCapnp(
  context: Context,
  reflection: ReflectionClass<any>,
  options: GenerateCapnpOptions
) {
  const capnpId = await generateCapnpId();

  return `${capnpId.trim()};
${getBaseFileHeader()
  .replace(/^\r*\n*/g, "")
  .replaceAll("//", "#")}
${
  reflection.getMethods().length === 0
    ? generateCapnpStruct(reflection, options)
    : generateCapnpInterface(reflection, options)
}
`.trim();
}

export interface GenerateCapnpStructOptions extends GenerateCapnpOptions {
  indexCounter?: () => number;
}

export function generateCapnpStruct(
  reflection: ReflectionClass<any>,
  options: GenerateCapnpStructOptions = {}
): string {
  const structName =
    options?.name ||
    reflection.getTitle() ||
    reflection.getClassName() ||
    reflection.getName();

  return `${generateCapnpEnums(reflection)}struct ${pascalCase(structName)} {
  # Struct definition for ${titleCase(structName)}.

  ${generateCapnpSchema(reflection, options)}
}
`;
}

export function generateCapnpInterface(
  reflection: ReflectionClass<any>,
  options: GenerateCapnpStructOptions = {}
): string {
  const interfaceName =
    options?.name ||
    reflection.getTitle() ||
    reflection.getClassName() ||
    reflection.getName();

  return `${generateCapnpEnums(reflection)}interface ${pascalCase(interfaceName)} {
  # Interface definition for ${titleCase(interfaceName)}.

  ${generateCapnpSchema(reflection, options)}
}
`;
}

function formatEnumName(name: string) {
  return pascalCase(`${name}_Type`);
}

function generateCapnpEnums(reflection: ReflectionClass<any>): string {
  const enums = reflection
    .getProperties()
    .filter(
      prop =>
        !prop.isIgnored() &&
        (prop.type.kind === ReflectionKind.enum ||
          (prop.type.kind === ReflectionKind.union &&
            getCapnpUnionTypes(prop.type).filter(
              type =>
                type.kind === ReflectionKind.literal &&
                (isString(type.literal) || isNumber(type.literal))
            ).length === 1))
    )
    .sort((a, b) =>
      (a.isReadonly() && b.isReadonly()) || (!a.isReadonly() && !b.isReadonly())
        ? b.getNameAsString().localeCompare(a.getNameAsString())
        : a.isReadonly()
          ? 1
          : -1
    );
  if (enums.length === 0) {
    return "";
  }

  return `${enums
    .map(enumeration =>
      generateCapnpEnumSchema(
        enumeration.type as TypeEnum | TypeUnion,
        formatEnumName(enumeration.getNameAsString())
      )
    )
    .join("\n\n")}

`;
}

export function generateCapnpSchema(
  reflection: ReflectionClass<any>,
  options: GenerateCapnpStructOptions = {}
): string {
  let index = 0;
  const indexCounter: () => number = options?.indexCounter ?? (() => index++);

  return `${reflection
    .getProperties()
    .filter(prop => !prop.isIgnored())
    .sort((a, b) =>
      (a.isReadonly() && b.isReadonly()) || (!a.isReadonly() && !b.isReadonly())
        ? b.getNameAsString().localeCompare(a.getNameAsString())
        : a.isReadonly()
          ? 1
          : -1
    )
    .map(prop => generateCapnpPropertySchema(prop, indexCounter))
    .join(" \n\n\t")}${reflection
    .getMethods()
    .filter(methods => !methods.isIgnored())
    .sort((a, b) =>
      (a.isReadonly() && b.isReadonly()) || (!a.isReadonly() && !b.isReadonly())
        ? String(b.getName()).localeCompare(String(a.getName()))
        : a.isReadonly()
          ? 1
          : -1
    )
    .map(methods => generateCapnpMethodSchema(methods, indexCounter))
    .join(" \n\n\t")}${
    reflection
      .getProperties()
      .some(
        prop =>
          prop.type.kind === ReflectionKind.class && prop.type.classType === Map
      )
      ? `
  struct Map(Key, Value) {
    entries @0 :List(Entry);

    struct Entry {
      key @0 :Key;
      value @1 :Value;
    }
  }`
      : ""
  }${
    reflection
      .getProperties()
      .some(
        prop =>
          prop.type.kind === ReflectionKind.class &&
          prop.type.classType === Date
      )
      ? `
  struct Date {
    # A standard Gregorian calendar date.

    year @0 :Int16;
    # The year - Must include the century.
    # Negative value indicates BC.

    month @1 :UInt8; # The month, 1-12

    day @2 :UInt8; # The day of the month, 1-30

    hour @3 :UInt8;    # The hour of the day, 0-23

    minute @4 :UInt8;  # The minute of the hour, 0-59

    second @5 :UInt8;  # The second of the minute, 0-59

    millisecond @6 :UInt16; # Milliseconds of the second, 0-999
  }`
      : ""
  }`;
}

export function generateCapnpMethodSchema(
  reflection: ReflectionMethod,
  indexCounter: () => number
): string {
  const methodName =
    reflection.getTitle() || typeof reflection.getName() === "string"
      ? String(reflection.getName())
      : "";
  if (!methodName) {
    throw new Error(
      `Cannot generate Cap'n Proto schema for method without a name - Parent interface: ${reflection.reflectionClass.getName()}`
    );
  }

  return `${camelCase(methodName)} @${indexCounter()} (${reflection
    .getParameters()
    .map(param => {
      return `${camelCase(
        param.getName()
      )} :${generateCapnpPrimitive(param.getType())}${
        param.hasDefault() ? ` = ${stringifyCapnpDefaultValue(param)}` : ""
      }`;
    })
    .join(", ")})${
    isVoidType(reflection.getReturnType())
      ? ""
      : ` -> (${kindToName(
          reflection.getReturnType().kind
        )}: ${generateCapnpPrimitive(reflection.getReturnType())})`
  }; # ${(
    reflection.getDescription() ||
    `The ${titleCase(
      reflection.reflectionClass.getTitle() ||
        reflection.reflectionClass.getName()
    )} interface ${titleCase(methodName)} method.`
  ).replaceAll("\n", ". ")}`;
}

function generateCapnpPropertyComment(reflection: ReflectionProperty) {
  const result = getWords(
    reflection.getDescription() ||
      `A schema property for ${titleCase(
        reflection.getTitle() || reflection.getNameAsString()
      )} field.`,
    {
      relaxed: true
    }
  )
    .reduce((ret, word) => {
      let length = ret.length;
      if (ret.includes("\n")) {
        length = ret.substring(ret.lastIndexOf("\n") + 1).length;
      }

      const current = word.trim();
      if (length + current.length > 60) {
        ret += `\n\t# ${current}`;
      } else {
        ret += ` ${current}`;
      }
      return ret;
    }, "")
    .trim();
  if (result.length > 0) {
    return `\t# ${result}`;
  }

  return "";
}

function generateCapnpPropertySchema(
  reflection: ReflectionProperty,
  indexCounter: () => number
): string {
  if (reflection.type.kind === ReflectionKind.union) {
    if (getCapnpUnionTypes(reflection.type).length === 0) {
      return `${camelCase(reflection.getNameAsString())} @${indexCounter()} :Void;
${generateCapnpPropertyComment(reflection)}`;
    } else if (
      getCapnpUnionTypes(reflection.type).filter(
        type =>
          type.kind === ReflectionKind.literal &&
          (isString(type.literal) || isNumber(type.literal))
      ).length === 1
    ) {
      return `${camelCase(reflection.getNameAsString())} @${indexCounter()} :${formatEnumName(
        reflection.getNameAsString()
      )}${
        reflection.hasDefault()
          ? ` = ${stringifyCapnpDefaultValue(reflection)}`
          : ""
      };
${generateCapnpPropertyComment(reflection)}`;
    } else {
      return `${camelCase(reflection.getNameAsString())} :union {
${getCapnpUnionTypes(reflection.type)
  .map(
    type =>
      `   ${kindToName(type.kind)} @${indexCounter()} :${generateCapnpPrimitive(
        type
      )};`
  )
  .join("\n")}
  }
${generateCapnpPropertyComment(reflection)}`;
    }
  } else if (reflection.type.kind === ReflectionKind.array) {
    return `${camelCase(reflection.getNameAsString())} @${indexCounter()} :List(${generateCapnpPrimitive(reflection.getSubType())})${
      reflection.hasDefault()
        ? ` = ${stringifyCapnpDefaultValue(reflection)}`
        : ""
    };
${generateCapnpPropertyComment(reflection)}`;
  } else if (reflection.type.kind === ReflectionKind.class) {
    if (reflection.type.classType === Map) {
      return `${camelCase(reflection.getNameAsString())} @${indexCounter()} :Map(${
        !reflection.type.typeArguments ||
        reflection.type.typeArguments.length === 0 ||
        !reflection.type.typeArguments[0]
          ? "Data"
          : generateCapnpPrimitive(reflection.type.typeArguments[0])
      }, ${
        !reflection.type.typeArguments ||
        reflection.type.typeArguments.length < 2 ||
        !reflection.type.typeArguments[1]
          ? "Data"
          : generateCapnpPrimitive(reflection.type.typeArguments[1])
      })${
        reflection.hasDefault()
          ? ` = ${stringifyCapnpDefaultValue(reflection)}`
          : ""
      };
${generateCapnpPropertyComment(reflection)}`;
    } else if (reflection.type.classType === Date) {
      return `${camelCase(reflection.getNameAsString())} @${indexCounter()} :Data${
        reflection.hasDefault()
          ? ` = ${stringifyCapnpDefaultValue(reflection)}`
          : ""
      };
${generateCapnpPropertyComment(reflection)}`;
    } else if (reflection.type.classType === Buffer) {
      return `${camelCase(reflection.getNameAsString())} @${indexCounter()} :Data${
        reflection.hasDefault()
          ? ` = ${stringifyCapnpDefaultValue(reflection)}`
          : ""
      };
${generateCapnpPropertyComment(reflection)}`;
    } else if (reflection.type.classType === ArrayBuffer) {
      return `${camelCase(reflection.getNameAsString())} @${indexCounter()} :Data${
        reflection.hasDefault()
          ? ` = ${stringifyCapnpDefaultValue(reflection)}`
          : ""
      };
${generateCapnpPropertyComment(reflection)}`;
    } else {
      return `${camelCase(reflection.getNameAsString())} @${indexCounter()} :${pascalCase(
        reflection.type.typeName || getClassName(reflection.type.classType)
      )}${generateCapnpStruct(reflection.reflectionClass, {
        name: pascalCase(
          reflection.type.typeName || getClassName(reflection.type.classType)
        )
      })}${
        reflection.hasDefault()
          ? ` = ${stringifyCapnpDefaultValue(reflection)}`
          : ""
      };
${generateCapnpPropertyComment(reflection)}`;
    }
  } else if (reflection.type.kind === ReflectionKind.objectLiteral) {
    return `${camelCase(reflection.getNameAsString())} @${indexCounter()} :${pascalCase(
      reflection.type.typeName ||
        memberNameToString(reflection.getNameAsString())
    )}${generateCapnpStruct(reflection.reflectionClass, {
      name: pascalCase(
        reflection.type.typeName ||
          memberNameToString(reflection.getNameAsString())
      )
    })}${
      reflection.hasDefault()
        ? ` = ${stringifyCapnpDefaultValue(reflection)}`
        : ""
    };
${generateCapnpPropertyComment(reflection)}`;
  } else if (reflection.type.kind === ReflectionKind.enum) {
    return `${camelCase(reflection.getNameAsString())} @${indexCounter()} :${pascalCase(
      reflection.getNameAsString()
    )}${
      reflection.hasDefault()
        ? ` = ${stringifyCapnpDefaultValue(reflection)}`
        : ""
    };
${generateCapnpPropertyComment(reflection)}`;
  }

  return `${camelCase(reflection.getNameAsString())} @${indexCounter()} :${generateCapnpPrimitive(
    reflection.getType()
  )}${
    reflection.hasDefault()
      ? ` = ${stringifyCapnpDefaultValue(reflection)}`
      : ""
  };
${generateCapnpPropertyComment(reflection)}`;
}

export function generateCapnpEnumSchema(
  type: TypeEnum | TypeUnion,
  name: string
): string {
  if (type.kind === ReflectionKind.union) {
    return generateCapnpEnumSchema(
      {
        kind: ReflectionKind.enum,
        indexType: type,
        enum: (type.types as TypeLiteral[]).reduce<
          Record<string, string | number>
        >((ret, type) => {
          if (isString(type.literal) || isNumber(type.literal)) {
            ret[camelCase(String(type.literal))] = type.literal;
          }

          return ret;
        }, {}),
        values: getCapnpUnionTypes(type)
          .filter(
            type =>
              type.kind === ReflectionKind.literal &&
              (isString(type.literal) || isNumber(type.literal))
          )
          .map((type: TypeLiteral) => type.literal as string | number)
      },
      name
    );
  }

  let index = 0;
  const indexCounter: () => number = () => index++;

  const enumType = getCapnpEnumTypes(type);
  if (!enumType) {
    return "";
  }

  return `enum ${pascalCase(name)} {
${
  type.enum && Object.entries(type.enum).length > 0
    ? Object.entries(type.enum)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([key]) => `    ${camelCase(key)} @${indexCounter()};`)
        .join("\n")
    : type.values
        .filter(value => value !== null && value !== undefined)
        .map(
          value =>
            `${
              enumType === "Text" && value
                ? camelCase(String(value))
                : `${
                    type.typeName ? `${camelCase(type.typeName)}_` : ""
                  }${value || ""}`
            } @${indexCounter()};`
        )
        .join("\n")
}
  }`;
}

export function generateCapnpPrimitive(type: Type) {
  return type.kind === ReflectionKind.never ||
    type.kind === ReflectionKind.void ||
    type.kind === ReflectionKind.null ||
    type.kind === ReflectionKind.undefined ||
    type.kind === ReflectionKind.symbol
    ? "Void"
    : type.kind === ReflectionKind.class && type.classType === Date
      ? "Date"
      : type.kind === ReflectionKind.class && type.classType === Set
        ? `List(${
            type.typeArguments && type.typeArguments[0]
              ? generateCapnpPrimitive(type.typeArguments[0])
              : "Data"
          })`
        : type.kind === ReflectionKind.bigint
          ? "UInt64"
          : type.kind === ReflectionKind.number
            ? "Float64"
            : type.kind === ReflectionKind.string ||
                type.kind === ReflectionKind.regexp
              ? "Text"
              : type.kind === ReflectionKind.boolean
                ? "Bool"
                : type.kind === ReflectionKind.literal
                  ? isNumber(type.literal)
                    ? "Float64"
                    : isBigInt(type.literal)
                      ? "UInt64"
                      : isString(type.literal)
                        ? "Text"
                        : typeof type.literal === "boolean"
                          ? "Bool"
                          : "Data"
                  : "Data";
}
