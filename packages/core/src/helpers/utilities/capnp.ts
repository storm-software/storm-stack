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

/* eslint-disable camelcase */

import {
  ReflectionKind,
  ReflectionVisibility,
  SerializedType,
  SerializedTypeArray,
  SerializedTypeClassType,
  SerializedTypeEnum,
  SerializedTypeFunction,
  SerializedTypeInfer,
  SerializedTypeIntersection,
  SerializedTypeLiteral,
  SerializedTypeMethodSignature,
  SerializedTypeObjectLiteral,
  SerializedTypeParameter,
  SerializedTypeProperty,
  SerializedTypePropertySignature,
  SerializedTypeReference,
  SerializedTypes,
  SerializedTypeTuple,
  SerializedTypeTupleMember,
  SerializedTypeUnion,
  SimpleSerializedType,
  TagsReflection
} from "@deepkit/type";
import { List } from "@stryke/capnp";
import { isInteger, isSetObject, isUndefined } from "@stryke/type-checks";
import {
  DefaultValueReflection as CapnpDefaultValueReflection,
  IndexAccessOrigin as CapnpIndexAccessOrigin,
  ReflectionVisibility as CapnpReflectionVisibility,
  SerializedType as CapnpSerializedType,
  SerializedTypeArray as CapnpSerializedTypeArray,
  SerializedTypeClassType as CapnpSerializedTypeClassType,
  SerializedTypeEnum as CapnpSerializedTypeEnum,
  SerializedTypeFunction as CapnpSerializedTypeFunction,
  SerializedTypeInfer as CapnpSerializedTypeInfer,
  SerializedTypeIntersection as CapnpSerializedTypeIntersection,
  SerializedTypeLiteral as CapnpSerializedTypeLiteral,
  SerializedTypeMethodSignature as CapnpSerializedTypeMethodSignature,
  SerializedTypeObjectLiteral as CapnpSerializedTypeObjectLiteral,
  SerializedTypeParameter as CapnpSerializedTypeParameter,
  SerializedTypeProperty as CapnpSerializedTypeProperty,
  SerializedTypePropertySignature as CapnpSerializedTypePropertySignature,
  SerializedTypeTuple as CapnpSerializedTypeTuple,
  SerializedTypeTupleMember as CapnpSerializedTypeTupleMember,
  SerializedTypeUnion as CapnpSerializedTypeUnion,
  SimpleSerializedType as CapnpSimpleSerializedType,
  TagsReflection as CapnpTagsReflection,
  SerializedType_Type
} from "../../../schemas/reflection";

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param serializedTypes - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 */
export function convertToCapnp(
  serializedTypes: SerializedTypes,
  result: List<CapnpSerializedType>
): List<CapnpSerializedType> {
  if (
    !serializedTypes ||
    !Array.isArray(serializedTypes) ||
    serializedTypes.length === 0
  ) {
    throw new Error("Invalid serialized type provided for conversion.");
  }

  if (serializedTypes.length !== result.length) {
    throw new Error(
      `Mismatch in length of serialized types: expected ${
        result.length
      }, got ${serializedTypes.length}.`
    );
  }

  serializedTypes
    .filter(
      serializedType =>
        isSetObject(serializedType) && !isUndefined(serializedType.kind)
    )
    .forEach((serializedType, index) => {
      convertToCapnpType(serializedType, result.get(index)._initType());
    });

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param serializedTypes - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema
 * @returns The [Deepkit](https://deepkit.io/) {@link SerializedTypes | serialized types} converted from the Cap'n Proto serialized type
 */
export function convertFromCapnp(
  serializedTypes: List<CapnpSerializedType>
): SerializedTypes {
  if (!serializedTypes) {
    throw new Error("Invalid serialized type provided for conversion.");
  }

  const result = [] as SerializedTypes;
  serializedTypes.forEach(serializedType => {
    const deserializedType = convertFromCapnpType(serializedType.type);
    result.push(deserializedType);
  });

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 */
export function convertToCapnpTypeTagsReflection(
  result: CapnpTagsReflection,
  serializedType?: TagsReflection
): CapnpTagsReflection {
  if (serializedType?.alias?.length) {
    const alias = result._initAlias(serializedType.alias.length);
    serializedType.alias.forEach((a, index) => {
      alias.set(index, a);
    });
  }

  result.hidden = serializedType?.hidden ?? false;
  result.ignore = serializedType?.ignore ?? false;
  result.internal = serializedType?.internal ?? false;
  result.readonly = serializedType?.readonly ?? false;

  if (serializedType?.title) {
    result.title = serializedType?.title;
  }

  if (serializedType?.domain) {
    result.domain = serializedType?.domain;
  }

  if (serializedType?.permission?.length) {
    const permission = result._initPermission(serializedType.permission.length);
    serializedType.permission?.forEach((p, index) => {
      permission.set(index, p);
    });
  }

  return result;
}

export interface WithTagsReflection {
  _hasTags: () => boolean;
  tags?: {
    alias: string[];
    hidden: boolean;
    domain: string;
    title: string;
    ignore: boolean;
    internal: boolean;
    readonly: boolean;
    permission: string[];
  };
}

export function convertFromCapnpTypeTagsReflection(
  serializedType: WithTagsReflection
) {
  return serializedType._hasTags()
    ? {
        alias: serializedType.tags?.alias?.length
          ? serializedType.tags?.alias.map(value => value)
          : undefined,
        hidden: serializedType.tags?.hidden,
        domain: serializedType.tags?.domain
          ? serializedType.tags.domain
          : undefined,
        title: serializedType.tags?.title
          ? serializedType.tags.title
          : undefined,
        ignore: serializedType.tags?.ignore,
        internal: serializedType.tags?.internal,
        readonly: serializedType.tags?.readonly,
        permission: serializedType.tags?.permission?.length
          ? serializedType.tags?.permission?.map(value => value)
          : undefined
      }
    : undefined;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 */
export function convertToCapnpTypeIndexAccessOrigin(
  result: CapnpIndexAccessOrigin,
  serializedType?: {
    container: SerializedTypeReference;
    index: SerializedTypeReference;
  }
): CapnpIndexAccessOrigin {
  const indexAccessOriginIndex = result._initIndex();
  indexAccessOriginIndex.id = serializedType?.index ?? 0;
  const indexAccessOriginContainer = result._initContainer();
  indexAccessOriginContainer.id = serializedType?.container ?? 0;

  return result;
}

export interface WithIndexAccessOrigin {
  _hasIndexAccessOrigin: () => boolean;
  indexAccessOrigin?: {
    container: {
      id: number;
    };
    index: {
      id: number;
    };
  };
}

export function convertFromCapnpTypeIndexAccessOrigin(
  serializedType: WithIndexAccessOrigin
) {
  return serializedType._hasIndexAccessOrigin()
    ? {
        container: Number(serializedType.indexAccessOrigin?.container.id),
        index: Number(serializedType.indexAccessOrigin?.index.id)
      }
    : undefined;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 */
export function convertToCapnpType(
  serializedType: SerializedType,
  result: SerializedType_Type
): SerializedType_Type {
  if (serializedType.kind === ReflectionKind.objectLiteral) {
    const objectLiteral = result._initObjectLiteral();
    convertToCapnpTypeObjectLiteral(serializedType, objectLiteral);
  } else if (serializedType.kind === ReflectionKind.class) {
    const classType = result._initClassType();
    convertToCapnpTypeClassType(serializedType, classType);
  } else if (serializedType.kind === ReflectionKind.parameter) {
    const parameter = result._initParameter();
    convertToCapnpTypeParameter(serializedType, parameter);
  } else if (serializedType.kind === ReflectionKind.function) {
    const functionType = result._initFunction();
    convertToCapnpTypeFunction(serializedType, functionType);
  } else if (serializedType.kind === ReflectionKind.infer) {
    const inferType = result._initInfer();
    convertToCapnpTypeInfer(serializedType, inferType);
  } else if (serializedType.kind === ReflectionKind.union) {
    const unionType = result._initUnion();
    convertToCapnpTypeUnion(serializedType, unionType);
  } else if (serializedType.kind === ReflectionKind.array) {
    const arrayType = result._initArray();
    convertToCapnpTypeArray(serializedType, arrayType);
  } else if (serializedType.kind === ReflectionKind.intersection) {
    const intersectionType = result._initIntersection();
    convertToCapnpTypeIntersection(serializedType, intersectionType);
  } else if (serializedType.kind === ReflectionKind.enum) {
    const enumType = result._initEnum();
    convertToCapnpTypeEnum(serializedType, enumType);
  } else if (serializedType.kind === ReflectionKind.property) {
    const propertyType = result._initProperty();
    convertToCapnpTypeProperty(serializedType, propertyType);
  } else if (serializedType.kind === ReflectionKind.tuple) {
    const tupleType = result._initTuple();
    convertToCapnpTypeTuple(serializedType, tupleType);
  } else if (serializedType.kind === ReflectionKind.tupleMember) {
    const tupleMemberType = result._initTupleMember();
    convertToCapnpTypeTupleMember(serializedType, tupleMemberType);
  } else if (serializedType.kind === ReflectionKind.propertySignature) {
    const propertySignatureType = result._initPropertySignature();
    convertToCapnpTypePropertySignature(serializedType, propertySignatureType);
  } else if (serializedType.kind === ReflectionKind.methodSignature) {
    const methodSignatureType = result._initMethodSignature();
    convertToCapnpTypeMethodSignature(serializedType, methodSignatureType);
  } else if (serializedType.kind === ReflectionKind.literal) {
    const literalType = result._initLiteral();
    convertToCapnpTypeLiteral(serializedType, literalType);
  } else if (
    serializedType.kind === ReflectionKind.string ||
    serializedType.kind === ReflectionKind.number ||
    serializedType.kind === ReflectionKind.boolean ||
    serializedType.kind === ReflectionKind.symbol ||
    serializedType.kind === ReflectionKind.bigint ||
    serializedType.kind === ReflectionKind.regexp ||
    serializedType.kind === ReflectionKind.null ||
    serializedType.kind === ReflectionKind.undefined ||
    serializedType.kind === ReflectionKind.never ||
    serializedType.kind === ReflectionKind.any ||
    serializedType.kind === ReflectionKind.unknown ||
    serializedType.kind === ReflectionKind.void
  ) {
    const simpleType = result._initSimple();
    convertToCapnpTypeSimple(serializedType, simpleType);
  } else {
    throw new Error(
      `Unsupported serialized type kind: ${
        serializedType.kind
      } \n\nType: ${JSON.stringify(serializedType, null, 2)}`
    );
  }

  return result;
}

export function convertFromCapnpType(
  serializedType: SerializedType_Type
): SerializedType {
  if (serializedType._isObjectLiteral) {
    return convertFromCapnpTypeObjectLiteral(serializedType.objectLiteral);
  } else if (serializedType._isClassType) {
    return convertFromCapnpTypeClassType(serializedType.classType);
  } else if (serializedType._isParameter) {
    return convertFromCapnpTypeParameter(serializedType.parameter);
  } else if (serializedType._isFunction) {
    return convertFromCapnpTypeFunction(serializedType.function);
  } else if (serializedType._isInfer) {
    return convertFromCapnpTypeInfer(serializedType.infer);
  } else if (serializedType._isUnion) {
    return convertFromCapnpTypeUnion(serializedType.union);
  } else if (serializedType._isArray) {
    return convertFromCapnpTypeArray(serializedType.array);
  } else if (serializedType._isIntersection) {
    return convertFromCapnpTypeIntersection(serializedType.intersection);
  } else if (serializedType._isEnum) {
    return convertFromCapnpTypeEnum(serializedType.enum);
  } else if (serializedType._isProperty) {
    return convertFromCapnpTypeProperty(serializedType.property);
  } else if (serializedType._isTuple) {
    return convertFromCapnpTypeTuple(serializedType.tuple);
  } else if (serializedType._isTupleMember) {
    return convertFromCapnpTypeTupleMember(serializedType.tupleMember);
  } else if (serializedType._isPropertySignature) {
    return convertFromCapnpTypePropertySignature(
      serializedType.propertySignature
    );
  } else if (serializedType._isMethodSignature) {
    return convertFromCapnpTypeMethodSignature(serializedType.methodSignature);
  } else if (serializedType._isLiteral) {
    return convertFromCapnpTypeLiteral(serializedType.literal);
  } else if (serializedType._isSimple) {
    return convertFromCapnpTypeSimple(serializedType.simple);
  } else {
    throw new Error(
      `Unsupported serialized type kind: ${serializedType.toString()}`
    );
  }
}

export function convertFromCapnpTypeSimple(
  serializedType: CapnpSimpleSerializedType
): SimpleSerializedType {
  const result: SimpleSerializedType = {
    kind: serializedType.kind as
      | ReflectionKind.never
      | ReflectionKind.any
      | ReflectionKind.unknown
      | ReflectionKind.void
      | ReflectionKind.object
      | ReflectionKind.string
      | ReflectionKind.number
      | ReflectionKind.boolean
      | ReflectionKind.symbol
      | ReflectionKind.bigint
      | ReflectionKind.null
      | ReflectionKind.undefined
      | ReflectionKind.regexp,
    typeName: serializedType.typeName || undefined,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType)
  };

  if (serializedType._hasOrigin()) {
    result.origin = Number(serializedType.origin.id);
  }

  return result;
}

export function convertToCapnpTypeSimple(
  serializedType: SimpleSerializedType,
  result: CapnpSimpleSerializedType
): CapnpSimpleSerializedType {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";

  if (serializedType.origin) {
    result._initOrigin();
    result.origin.id = serializedType.origin ?? 0;
  }

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(serializedType.decorators.length);
    serializedType.decorators.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments.length
    );
    serializedType.typeArguments.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpTypeLiteral(
  serializedType: CapnpSerializedTypeLiteral
): SerializedTypeLiteral {
  const result: SerializedTypeLiteral = {
    kind: ReflectionKind.literal,
    literal: serializedType.literal._isString
      ? serializedType.literal.string
      : serializedType.literal._isNumber
        ? serializedType.literal.number
        : serializedType.literal._isBoolean
          ? serializedType.literal.boolean
          : serializedType.literal._isBigint
            ? {
                type: "bigint",
                value: serializedType.literal.bigint.value
              }
            : serializedType.literal._isSymbol
              ? {
                  type: "symbol",
                  name: serializedType.literal.symbol.name
                }
              : {
                  type: "regex",
                  regex: serializedType.literal.regex.regex
                },
    typeName: serializedType.typeName || undefined,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType)
  };

  return result;
}

export function convertToCapnpTypeLiteral(
  serializedType: SerializedTypeLiteral,
  result: CapnpSerializedTypeLiteral
): CapnpSerializedTypeLiteral {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";

  const literalType = result._initLiteral();
  if (typeof serializedType.literal === "boolean") {
    literalType.boolean = serializedType.literal;
  } else if (typeof serializedType.literal === "number") {
    literalType.number = serializedType.literal;
  } else if (typeof serializedType.literal === "string") {
    literalType.string = serializedType.literal;
  } else if (serializedType.literal.type === "bigint") {
    const literalTypeBigint = literalType._initBigint();
    literalTypeBigint.type = "bigint";
    literalTypeBigint.value = serializedType.literal.value;
  } else if (serializedType.literal.type === "symbol") {
    const literalTypeSymbol = literalType._initSymbol();
    literalTypeSymbol.type = "symbol";
    literalTypeSymbol.name = serializedType.literal.name
      .toString()
      .slice(7, -1);
  } else if (serializedType.literal.type === "regex") {
    const literalTypeRegex = literalType._initRegex();
    literalTypeRegex.type = "regex";
    literalTypeRegex.regex = serializedType.literal.regex;
  }

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(serializedType.decorators.length);
    serializedType.decorators.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments.length
    );
    serializedType.typeArguments.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpTypeMethodSignature(
  serializedType: CapnpSerializedTypeMethodSignature
): SerializedTypeMethodSignature {
  const result: SerializedTypeMethodSignature = {
    kind: ReflectionKind.methodSignature,
    name: serializedType.name,
    typeName: serializedType.typeName || undefined,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    parameters: serializedType._hasParameters()
      ? serializedType.parameters.map(p => convertFromCapnpTypeParameter(p))
      : [],
    return: serializedType.return.id,
    tags: convertFromCapnpTypeTagsReflection(serializedType)
  };

  return result;
}

export function convertToCapnpTypeMethodSignature(
  serializedType: SerializedTypeMethodSignature,
  result: CapnpSerializedTypeMethodSignature
): CapnpSerializedTypeMethodSignature {
  result.kind = serializedType.kind;
  result.name = String(serializedType.name);
  result.typeName = serializedType.typeName || "";

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(serializedType.decorators.length);
    serializedType.decorators.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments.length
    );
    serializedType.typeArguments.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTypeTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpTypePropertySignature(
  serializedType: CapnpSerializedTypePropertySignature
): SerializedTypePropertySignature {
  const result: SerializedTypePropertySignature = {
    kind: ReflectionKind.propertySignature,
    name: serializedType.name,
    typeName: serializedType.typeName || undefined,
    description: serializedType.description,
    default: convertFromCapnpTypeDefault(serializedType.default),
    optional: serializedType.optional ? true : undefined,
    readonly: serializedType.readonly ? true : undefined,
    type: serializedType.type.id,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTypeTagsReflection(serializedType)
  };

  return result;
}

export function convertToCapnpTypeDefault(
  defaultValue: any,
  result: CapnpDefaultValueReflection
) {
  if (typeof defaultValue !== "undefined" && defaultValue !== "") {
    result._initValue();

    if (typeof defaultValue === "string") {
      result.value.string = defaultValue;
    } else if (typeof defaultValue === "number") {
      if (isInteger(defaultValue)) {
        result.value.integer = defaultValue;
      } else {
        result.value.float = defaultValue;
      }
    } else if (typeof defaultValue === "boolean") {
      result.value.boolean = defaultValue;
    }
  }
}

export function convertFromCapnpTypeDefault(
  serializedType: CapnpDefaultValueReflection
): any {
  if (typeof serializedType.value === "undefined") {
    return undefined;
  } else if (serializedType.value._isBoolean) {
    return serializedType.value.boolean;
  } else if (serializedType.value._isInteger) {
    return serializedType.value.integer;
  } else if (serializedType.value._isFloat) {
    return serializedType.value.float;
  } else if (serializedType.value._isString) {
    return serializedType.value.string;
  }
}

export function convertToCapnpTypePropertySignature(
  serializedType: SerializedTypePropertySignature,
  result: CapnpSerializedTypePropertySignature
): CapnpSerializedTypePropertySignature {
  result.kind = serializedType.kind;
  result.name = String(serializedType.name) || "";
  result.typeName = serializedType.typeName || "";
  result.description = serializedType.description || "";
  result.optional = serializedType.optional ?? false;
  result.readonly = serializedType.readonly ?? false;

  if (typeof serializedType.default !== "undefined") {
    const defaultValue = result._initDefault();
    convertToCapnpTypeDefault(serializedType.default, defaultValue);
  }

  const type = result._initType();
  type.id = serializedType.type;

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(serializedType.decorators.length);
    serializedType.decorators.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments.length
    );
    serializedType.typeArguments.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTypeTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertToCapnpTypeTupleMember(
  serializedType: SerializedTypeTupleMember,
  result: CapnpSerializedTypeTupleMember
): CapnpSerializedTypeTupleMember {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";

  const type = result._initType();
  type.id = serializedType.type;

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(serializedType.decorators.length);
    serializedType.decorators.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments.length
    );
    serializedType.typeArguments.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpTypeTupleMember(
  serializedType: CapnpSerializedTypeTupleMember
): SerializedTypeTupleMember {
  const result: SerializedTypeTupleMember = {
    kind: ReflectionKind.tupleMember,
    type: serializedType.type.id,
    typeName: serializedType.typeName || undefined,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType)
  };

  return result;
}

export function convertToCapnpTypeTuple(
  serializedType: SerializedTypeTuple,
  result: CapnpSerializedTypeTuple
): CapnpSerializedTypeTuple {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";

  const types = result._initTypes(serializedType.types.length);
  serializedType.types.forEach((t, index) => {
    const serializedTypeType = types.get(index);
    convertToCapnpTypeTupleMember(t, serializedTypeType);
  });

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(
      serializedType.decorators?.length ?? 0
    );
    serializedType.decorators?.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments?.length ?? 0
    );
    serializedType.typeArguments?.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpTypeTuple(
  serializedType: CapnpSerializedTypeTuple
): SerializedTypeTuple {
  const result: SerializedTypeTuple = {
    kind: ReflectionKind.tuple,
    typeName: serializedType.typeName || undefined,
    types: serializedType._hasTypes()
      ? serializedType.types.map(t => convertFromCapnpTypeTupleMember(t))
      : [],
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType)
  };

  return result;
}

export function convertToCapnpTypeProperty(
  serializedType: SerializedTypeProperty,
  result: CapnpSerializedTypeProperty
): CapnpSerializedTypeProperty {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";
  result.description = serializedType.description || "";
  result.optional = serializedType.optional ?? false;
  result.readonly = serializedType.readonly ?? false;
  result.visibility =
    serializedType.visibility === ReflectionVisibility.public
      ? CapnpReflectionVisibility.PUBLIC
      : serializedType.visibility === ReflectionVisibility.protected
        ? CapnpReflectionVisibility.PROTECTED
        : CapnpReflectionVisibility.PRIVATE;
  result.abstract = serializedType.abstract ?? false;
  result.name = String(serializedType.name) || "";

  if (typeof serializedType.default !== "undefined") {
    const defaultValue = result._initDefault();
    convertToCapnpTypeDefault(serializedType.default, defaultValue);
  }

  const type = result._initType();
  type.id = serializedType.type;

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(
      serializedType.decorators?.length ?? 0
    );
    serializedType.decorators?.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments?.length ?? 0
    );
    serializedType.typeArguments?.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTypeTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpTypeProperty(
  serializedType: CapnpSerializedTypeProperty
): SerializedTypeProperty {
  const result: SerializedTypeProperty = {
    kind: ReflectionKind.property,
    typeName: serializedType.typeName || undefined,
    description: serializedType.description,
    default: convertFromCapnpTypeDefault(serializedType.default),
    optional: serializedType.optional ? true : undefined,
    readonly: serializedType.readonly ? true : undefined,
    visibility:
      serializedType.visibility === CapnpReflectionVisibility.PUBLIC
        ? ReflectionVisibility.public
        : serializedType.visibility === CapnpReflectionVisibility.PROTECTED
          ? ReflectionVisibility.protected
          : ReflectionVisibility.private,
    abstract: serializedType.abstract ? true : undefined,
    name: serializedType.name,
    type: serializedType.type.id,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTypeTagsReflection(serializedType)
  };

  return result;
}

export function convertToCapnpTypeEnum(
  serializedType: SerializedTypeEnum,
  result: CapnpSerializedTypeEnum
): CapnpSerializedTypeEnum {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";

  const indexType = result._initIndexType();
  indexType.id = serializedType.indexType;

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(
      serializedType.decorators?.length ?? 0
    );
    serializedType.decorators?.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments?.length ?? 0
    );
    serializedType.typeArguments?.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.values?.length) {
    const values = result._initValues(serializedType.values?.length);
    serializedType.values.forEach((value, index) => {
      values.set(index, String(value));
    });
  }

  const enumEntries = result._initEnumEntries(
    Object.keys(serializedType.enum).length ?? 0
  );
  Object.entries(serializedType.enum).forEach(([key, value], index) => {
    const enumEntry = enumEntries.get(index);
    enumEntry.name = key;
    enumEntry.value = String(value);
  });

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTypeTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpTypeEnum(
  serializedType: CapnpSerializedTypeEnum
): SerializedTypeEnum {
  const result: SerializedTypeEnum = {
    kind: ReflectionKind.enum,
    typeName: serializedType.typeName || undefined,
    indexType: serializedType.indexType.id,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    values: serializedType._hasValues()
      ? serializedType.values.map(value => value)
      : [],
    enum: serializedType._hasEnumEntries()
      ? Object.entries(serializedType.enumEntries).reduce(
          (ret, [key, value]) => {
            ret[key] = value.value;
            return ret;
          },
          {}
        )
      : {},
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTypeTagsReflection(serializedType)
  };

  return result;
}

export function convertToCapnpTypeIntersection(
  serializedType: SerializedTypeIntersection,
  result: CapnpSerializedTypeIntersection
): CapnpSerializedTypeIntersection {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";

  const types = result._initTypes(serializedType.types?.length ?? 0);
  serializedType.types?.forEach((t, index) => {
    const serializedTypeType = types.get(index);
    serializedTypeType.id = t;
  });

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(
      serializedType.decorators?.length ?? 0
    );
    serializedType.decorators?.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments?.length ?? 0
    );
    serializedType.typeArguments?.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpTypeIntersection(
  serializedType: CapnpSerializedTypeIntersection
): SerializedTypeIntersection {
  const result: SerializedTypeIntersection = {
    kind: ReflectionKind.intersection,
    typeName: serializedType.typeName || undefined,
    types: serializedType._hasTypes()
      ? serializedType.types.map(t => t.id)
      : [],
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType)
  };

  return result;
}

export function convertToCapnpTypeArray(
  serializedType: SerializedTypeArray,
  result: CapnpSerializedTypeArray
): CapnpSerializedTypeArray {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";

  const type = result._initType();
  type.id = serializedType.type;

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(
      serializedType.decorators?.length ?? 0
    );
    serializedType.decorators?.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments?.length ?? 0
    );
    serializedType.typeArguments?.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTypeTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpTypeArray(
  serializedType: CapnpSerializedTypeArray
): SerializedTypeArray {
  const result: SerializedTypeArray = {
    kind: ReflectionKind.array,
    typeName: serializedType.typeName || undefined,
    type: serializedType.type.id,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTypeTagsReflection(serializedType)
  };

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 */
export function convertToCapnpTypeUnion(
  serializedType: SerializedTypeUnion,
  result: CapnpSerializedTypeUnion
): CapnpSerializedTypeUnion {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";

  const types = result._initTypes(serializedType.types?.length ?? 0);
  serializedType.types?.forEach((t, index) => {
    const serializedTypeType = types.get(index);
    serializedTypeType.id = t;
  });

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(
      serializedType.decorators?.length ?? 0
    );
    serializedType.decorators?.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments?.length ?? 0
    );
    serializedType.typeArguments?.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpTypeUnion(
  serializedType: CapnpSerializedTypeUnion
): SerializedTypeUnion {
  const result: SerializedTypeUnion = {
    kind: ReflectionKind.union,
    typeName: serializedType.typeName || undefined,
    types: serializedType._hasTypes()
      ? serializedType.types.map(t => t.id)
      : [],
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType)
  };

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 */
export function convertToCapnpTypeInfer(
  serializedType: SerializedTypeInfer,
  result: CapnpSerializedTypeInfer
): CapnpSerializedTypeInfer {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(
      serializedType.decorators?.length ?? 0
    );
    serializedType.decorators?.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments?.length ?? 0
    );
    serializedType.typeArguments?.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpTypeInfer(
  serializedType: CapnpSerializedTypeInfer
): SerializedTypeInfer {
  const result: SerializedTypeInfer = {
    kind: ReflectionKind.infer,
    typeName: serializedType.typeName || undefined,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType)
  };

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 */
export function convertToCapnpTypeFunction(
  serializedType: SerializedTypeFunction,
  result: CapnpSerializedTypeFunction
): CapnpSerializedTypeFunction {
  result.name = String(serializedType.name) || "";
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(serializedType.decorators.length);
    serializedType.decorators.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments.length
    );
    serializedType.typeArguments.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.parameters?.length) {
    const parameters = result._initParameters(serializedType.parameters.length);
    serializedType.parameters.forEach((p, index) => {
      const parameter = parameters.get(index);
      convertToCapnpTypeParameter(p, parameter);
    });
  }

  const returnType = result._initReturn();
  returnType.id = serializedType.return;

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTypeTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpTypeFunction(
  serializedType: CapnpSerializedTypeFunction
): SerializedTypeFunction {
  const result: SerializedTypeFunction = {
    kind: ReflectionKind.function,
    name: serializedType.name,
    typeName: serializedType.typeName || undefined,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    parameters: serializedType._hasParameters()
      ? serializedType.parameters.map(p => convertFromCapnpTypeParameter(p))
      : [],
    return: serializedType.return.id,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTypeTagsReflection(serializedType)
  };

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 */
export function convertToCapnpTypeClassType(
  serializedType: SerializedTypeClassType,
  result: CapnpSerializedTypeClassType
): CapnpSerializedTypeClassType {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";
  result.classType = serializedType.classType || "";
  result.globalObject = serializedType.globalObject ?? false;

  if (serializedType.arguments?.length) {
    const _arguments = result._initArguments(serializedType.arguments.length);
    serializedType.arguments.forEach((t, index) => {
      const serializedTypeArguments = _arguments.get(index);
      serializedTypeArguments.id = t;
    });
  }

  if (serializedType.extendsArguments?.length) {
    const extendsArguments = result._initArguments(
      serializedType.extendsArguments.length
    );
    serializedType.extendsArguments.forEach((t, index) => {
      const serializedTypeExtendsArguments = extendsArguments.get(index);
      serializedTypeExtendsArguments.id = t;
    });
  }

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(serializedType.decorators.length);
    serializedType.decorators.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments.length
    );
    serializedType.typeArguments.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.superClass) {
    const superClass = result._initSuperClass();
    superClass.id = serializedType.superClass;
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTypeTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpTypeClassType(
  serializedType: CapnpSerializedTypeClassType
): SerializedTypeClassType {
  const result: SerializedTypeClassType = {
    kind: ReflectionKind.class,
    typeName: serializedType.typeName || undefined,
    classType: serializedType.classType,
    globalObject: serializedType.globalObject ? true : undefined,
    arguments: serializedType._hasArguments()
      ? serializedType.arguments.map(t => t.id)
      : undefined,
    extendsArguments: serializedType._hasExtendsArguments()
      ? serializedType.extendsArguments.map(t => t.id)
      : undefined,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    types: serializedType._hasTypes()
      ? serializedType.types.map(t => t.id)
      : [],
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    superClass: serializedType._hasSuperClass()
      ? serializedType.superClass.id
      : undefined,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTypeTagsReflection(serializedType)
  };

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 */
export function convertToCapnpTypeObjectLiteral(
  serializedType: SerializedTypeObjectLiteral,
  result: CapnpSerializedTypeObjectLiteral
): CapnpSerializedTypeObjectLiteral {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(
      serializedType.decorators?.length ?? 0
    );
    serializedType.decorators.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.types?.length) {
    const types = result._initTypes(serializedType.types.length);
    serializedType.types.forEach((t, index) => {
      const serializedTypeType = types.get(index);
      serializedTypeType.id = t;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments.length
    );
    serializedType.typeArguments.forEach((t, index) => {
      const serializedTypeTypeArguments = typeArguments.get(index);
      serializedTypeTypeArguments.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTypeTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpTypeObjectLiteral(
  serializedType: CapnpSerializedTypeObjectLiteral
): SerializedTypeObjectLiteral {
  const result: SerializedTypeObjectLiteral = {
    kind: ReflectionKind.objectLiteral,
    typeName: serializedType.typeName || undefined,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    types: serializedType._hasTypes()
      ? serializedType.types.map(t => t.id)
      : [],
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTypeTagsReflection(serializedType)
  };

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 */
export function convertToCapnpTypeParameter(
  serializedType: SerializedTypeParameter,
  result: CapnpSerializedTypeParameter
): CapnpSerializedTypeParameter {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";
  result.name = serializedType.name || "";
  result.optional = serializedType.optional ?? false;
  result.readonly = serializedType.readonly ?? false;
  result.visibility =
    serializedType.visibility === ReflectionVisibility.public
      ? CapnpReflectionVisibility.PUBLIC
      : serializedType.visibility === ReflectionVisibility.protected
        ? CapnpReflectionVisibility.PROTECTED
        : CapnpReflectionVisibility.PRIVATE;

  if (typeof serializedType.default !== "undefined") {
    const defaultValue = result._initDefault();
    convertToCapnpTypeDefault(serializedType.default, defaultValue);
  }

  const parameterType = result._initType();
  parameterType.id = serializedType.type;

  if (serializedType.decorators?.length) {
    const decorators = result._initDecorators(serializedType.decorators.length);
    serializedType.decorators.forEach((d, index) => {
      const decorator = decorators.get(index);
      decorator.id = d;
    });
  }

  if (serializedType.typeArguments?.length) {
    const typeArguments = result._initTypeArguments(
      serializedType.typeArguments.length
    );
    serializedType.typeArguments.forEach((t, index) => {
      const typeArgument = typeArguments.get(index);
      typeArgument.id = t;
    });
  }

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpTypeIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTypeTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpTypeParameter(
  serializedType: CapnpSerializedTypeParameter
): SerializedTypeParameter {
  const result: SerializedTypeParameter = {
    kind: ReflectionKind.parameter,
    typeName: serializedType.typeName || undefined,
    name: serializedType.name,
    default: convertFromCapnpTypeDefault(serializedType.default),
    optional: serializedType.optional ? true : undefined,
    readonly: serializedType.readonly ? true : undefined,
    visibility:
      serializedType.visibility === CapnpReflectionVisibility.PUBLIC
        ? ReflectionVisibility.public
        : serializedType.visibility === CapnpReflectionVisibility.PROTECTED
          ? ReflectionVisibility.protected
          : ReflectionVisibility.private,
    type: serializedType.type.id,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpTypeIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTypeTagsReflection(serializedType)
  };

  return result;
}
