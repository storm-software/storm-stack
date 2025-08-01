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
  SerializedTypeMethod,
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
  SerializedTypeMethod as CapnpSerializedTypeMethod,
  SerializedTypeMethodSignature as CapnpSerializedTypeMethodSignature,
  SerializedTypeObjectLiteral as CapnpSerializedTypeObjectLiteral,
  SerializedTypeOther as CapnpSerializedTypeOther,
  SerializedTypeParameter as CapnpSerializedTypeParameter,
  SerializedTypeProperty as CapnpSerializedTypeProperty,
  SerializedTypePropertySignature as CapnpSerializedTypePropertySignature,
  SerializedTypeTuple as CapnpSerializedTypeTuple,
  SerializedTypeTupleMember as CapnpSerializedTypeTupleMember,
  SerializedTypeUnion as CapnpSerializedTypeUnion,
  SimpleSerializedType as CapnpSimpleSerializedType,
  TagsReflection as CapnpTagsReflection,
  SerializedType_Type
} from "../../schemas/reflection";

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
      convertToCapnpBase(serializedType, result.get(index)._initType());
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
    const deserializedType = convertFromCapnpBase(serializedType.type);
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
export function convertToCapnpTagsReflection(
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

export function convertFromCapnpTagsReflection(
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

interface CapnpIndexAccessOriginSerializedType {
  container: SerializedTypeReference;
  index: SerializedTypeReference;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 */
export function convertToCapnpIndexAccessOrigin(
  result: CapnpIndexAccessOrigin,
  serializedType?: CapnpIndexAccessOriginSerializedType
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

export function convertFromCapnpIndexAccessOrigin(
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
export function convertToCapnpBase(
  serializedType: SerializedType,
  result: SerializedType_Type
): SerializedType_Type {
  if (serializedType.kind === ReflectionKind.objectLiteral) {
    const objectLiteral = result._initObjectLiteral();
    convertToCapnpObjectLiteral(serializedType, objectLiteral);
  } else if (serializedType.kind === ReflectionKind.class) {
    const classType = result._initClassType();
    convertToCapnpClassType(serializedType, classType);
  } else if (serializedType.kind === ReflectionKind.parameter) {
    const parameter = result._initParameter();
    convertToCapnpParameter(serializedType, parameter);
  } else if (serializedType.kind === ReflectionKind.function) {
    const functionType = result._initFunction();
    convertToCapnpFunction(serializedType, functionType);
  } else if (serializedType.kind === ReflectionKind.method) {
    const methodType = result._initMethod();
    convertToCapnpMethod(serializedType, methodType);
  } else if (serializedType.kind === ReflectionKind.infer) {
    const inferType = result._initInfer();
    convertToCapnpInfer(serializedType, inferType);
  } else if (serializedType.kind === ReflectionKind.union) {
    const unionType = result._initUnion();
    convertToCapnpUnion(serializedType, unionType);
  } else if (serializedType.kind === ReflectionKind.array) {
    const arrayType = result._initArray();
    convertToCapnpArray(serializedType, arrayType);
  } else if (serializedType.kind === ReflectionKind.intersection) {
    const intersectionType = result._initIntersection();
    convertToCapnpIntersection(serializedType, intersectionType);
  } else if (serializedType.kind === ReflectionKind.enum) {
    const enumType = result._initEnum();
    convertToCapnpEnum(serializedType, enumType);
  } else if (serializedType.kind === ReflectionKind.property) {
    const propertyType = result._initProperty();
    convertToCapnpProperty(serializedType, propertyType);
  } else if (serializedType.kind === ReflectionKind.tuple) {
    const tupleType = result._initTuple();
    convertToCapnpTuple(serializedType, tupleType);
  } else if (serializedType.kind === ReflectionKind.tupleMember) {
    const tupleMemberType = result._initTupleMember();
    convertToCapnpTupleMember(serializedType, tupleMemberType);
  } else if (serializedType.kind === ReflectionKind.propertySignature) {
    const propertySignatureType = result._initPropertySignature();
    convertToCapnpPropertySignature(serializedType, propertySignatureType);
  } else if (serializedType.kind === ReflectionKind.methodSignature) {
    const methodSignatureType = result._initMethodSignature();
    convertToCapnpMethodSignature(serializedType, methodSignatureType);
  } else if (serializedType.kind === ReflectionKind.literal) {
    const literalType = result._initLiteral();
    convertToCapnpLiteral(serializedType, literalType);
  } else if (
    serializedType.kind === ReflectionKind.never ||
    serializedType.kind === ReflectionKind.any ||
    serializedType.kind === ReflectionKind.unknown ||
    serializedType.kind === ReflectionKind.void ||
    serializedType.kind === ReflectionKind.object ||
    serializedType.kind === ReflectionKind.string ||
    serializedType.kind === ReflectionKind.number ||
    serializedType.kind === ReflectionKind.boolean ||
    serializedType.kind === ReflectionKind.symbol ||
    serializedType.kind === ReflectionKind.bigint ||
    serializedType.kind === ReflectionKind.null ||
    serializedType.kind === ReflectionKind.undefined ||
    serializedType.kind === ReflectionKind.regexp
  ) {
    const simpleType = result._initSimple();
    convertToCapnpSimple(serializedType, simpleType);
  } else {
    const otherType = result._initOther();
    convertToCapnpOther(serializedType, otherType);
  }

  return result;
}

export function convertFromCapnpBase(
  serializedType: SerializedType_Type
): SerializedType {
  if (serializedType._isObjectLiteral) {
    return convertFromCapnpObjectLiteral(serializedType.objectLiteral);
  } else if (serializedType._isClassType) {
    return convertFromCapnpClassType(serializedType.classType);
  } else if (serializedType._isParameter) {
    return convertFromCapnpParameter(serializedType.parameter);
  } else if (serializedType._isFunction) {
    return convertFromCapnpFunction(serializedType.function);
  } else if (serializedType._isInfer) {
    return convertFromCapnpInfer(serializedType.infer);
  } else if (serializedType._isMethod) {
    return convertFromCapnpMethod(serializedType.method);
  } else if (serializedType._isUnion) {
    return convertFromCapnpUnion(serializedType.union);
  } else if (serializedType._isArray) {
    return convertFromCapnpArray(serializedType.array);
  } else if (serializedType._isIntersection) {
    return convertFromCapnpIntersection(serializedType.intersection);
  } else if (serializedType._isEnum) {
    return convertFromCapnpEnum(serializedType.enum);
  } else if (serializedType._isProperty) {
    return convertFromCapnpProperty(serializedType.property);
  } else if (serializedType._isTuple) {
    return convertFromCapnpTuple(serializedType.tuple);
  } else if (serializedType._isTupleMember) {
    return convertFromCapnpTupleMember(serializedType.tupleMember);
  } else if (serializedType._isPropertySignature) {
    return convertFromCapnpPropertySignature(serializedType.propertySignature);
  } else if (serializedType._isMethodSignature) {
    return convertFromCapnpMethodSignature(serializedType.methodSignature);
  } else if (serializedType._isLiteral) {
    return convertFromCapnpLiteral(serializedType.literal);
  } else if (serializedType._isSimple) {
    return convertFromCapnpSimple(serializedType.simple);
  } else if (serializedType._isOther) {
    return convertFromCapnpOther(serializedType.other);
  } else {
    throw new Error(
      `Unsupported serialized type kind: ${serializedType.toString()}`
    );
  }
}

export function convertFromCapnpOther(
  serializedType: CapnpSerializedTypeOther
): SerializedType {
  return {
    kind: serializedType.kind,
    typeName: serializedType.typeName || undefined
  } as SerializedType;
}

export function convertFromCapnpSimple(
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
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType)
  };

  if (serializedType._hasOrigin()) {
    result.origin = Number(serializedType.origin.id);
  }

  return result;
}

export function convertToCapnpOther(
  serializedType: {
    kind: ReflectionKind;
    typeName?: string;
  },
  result: CapnpSerializedTypeOther
): CapnpSerializedTypeOther {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";

  return result;
}

export function convertToCapnpSimple(
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpLiteral(
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
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType)
  };

  return result;
}

export function convertToCapnpLiteral(
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpMethodSignature(
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
      ? serializedType.parameters.map(p => convertFromCapnpParameter(p))
      : [],
    return: serializedType.return.id,
    tags: convertFromCapnpTagsReflection(serializedType)
  };

  return result;
}

export function convertToCapnpMethodSignature(
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpPropertySignature(
  serializedType: CapnpSerializedTypePropertySignature
): SerializedTypePropertySignature {
  const result: SerializedTypePropertySignature = {
    kind: ReflectionKind.propertySignature,
    name: serializedType.name,
    typeName: serializedType.typeName || undefined,
    description: serializedType.description,
    default: convertFromCapnpDefault(serializedType.default),
    optional: serializedType.optional ? true : undefined,
    readonly: serializedType.readonly ? true : undefined,
    type: serializedType.type.id,
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTagsReflection(serializedType)
  };

  return result;
}

export function convertToCapnpDefault(
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

export function convertFromCapnpDefault(
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

export function convertToCapnpPropertySignature(
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
    convertToCapnpDefault(serializedType.default, defaultValue);
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertToCapnpTupleMember(
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpTupleMember(
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
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType)
  };

  return result;
}

export function convertToCapnpTuple(
  serializedType: SerializedTypeTuple,
  result: CapnpSerializedTypeTuple
): CapnpSerializedTypeTuple {
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";

  const types = result._initTypes(serializedType.types.length);
  serializedType.types.forEach((t, index) => {
    const serializedTypeType = types.get(index);
    convertToCapnpTupleMember(t, serializedTypeType);
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpTuple(
  serializedType: CapnpSerializedTypeTuple
): SerializedTypeTuple {
  const result: SerializedTypeTuple = {
    kind: ReflectionKind.tuple,
    typeName: serializedType.typeName || undefined,
    types: serializedType._hasTypes()
      ? serializedType.types.map(t => convertFromCapnpTupleMember(t))
      : [],
    decorators: serializedType._hasDecorators()
      ? serializedType.decorators.map(d => d.id)
      : undefined,
    typeArguments: serializedType._hasTypeArguments()
      ? serializedType.typeArguments.map(t => t.id)
      : undefined,
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType)
  };

  return result;
}

export function convertToCapnpProperty(
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
    convertToCapnpDefault(serializedType.default, defaultValue);
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpProperty(
  serializedType: CapnpSerializedTypeProperty
): SerializedTypeProperty {
  const result: SerializedTypeProperty = {
    kind: ReflectionKind.property,
    typeName: serializedType.typeName || undefined,
    description: serializedType.description,
    default: convertFromCapnpDefault(serializedType.default),
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
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTagsReflection(serializedType)
  };

  return result;
}

export function convertToCapnpEnum(
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
    convertToCapnpIndexAccessOrigin(
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
    convertToCapnpTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpEnum(
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
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTagsReflection(serializedType)
  };

  return result;
}

export function convertToCapnpIntersection(
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpIntersection(
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
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType)
  };

  return result;
}

export function convertToCapnpArray(
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpArray(
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
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTagsReflection(serializedType)
  };

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 */
export function convertToCapnpUnion(
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpUnion(
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
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType)
  };

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 */
export function convertToCapnpInfer(
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  return result;
}

export function convertFromCapnpInfer(
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
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType)
  };

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 */
export function convertToCapnpFunction(
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
      convertToCapnpParameter(p, parameter);
    });
  }

  const returnType = result._initReturn();
  returnType.id = serializedType.return;

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTagsReflection(tags, serializedType.tags);
  }

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 */
export function convertToCapnpMethod(
  serializedType: SerializedTypeMethod,
  result: CapnpSerializedTypeMethod
): CapnpSerializedTypeMethod {
  result.name = String(serializedType.name) || "";
  result.kind = serializedType.kind;
  result.typeName = serializedType.typeName || "";
  result.abstract = serializedType.abstract ?? false;
  result.visibility =
    serializedType.visibility === ReflectionVisibility.public
      ? CapnpReflectionVisibility.PUBLIC
      : serializedType.visibility === ReflectionVisibility.protected
        ? CapnpReflectionVisibility.PROTECTED
        : CapnpReflectionVisibility.PRIVATE;

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
      convertToCapnpParameter(p, parameter);
    });
  }

  const returnType = result._initReturn();
  returnType.id = serializedType.return;

  if (serializedType.indexAccessOrigin) {
    const indexAccessOrigin = result._initIndexAccessOrigin();
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpFunction(
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
      ? serializedType.parameters.map(p => convertFromCapnpParameter(p))
      : [],
    return: serializedType.return.id,
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTagsReflection(serializedType)
  };

  return result;
}

function convertFromCapnpMethod(
  serializedType: CapnpSerializedTypeMethod
): SerializedTypeMethod {
  const result: SerializedTypeMethod = {
    kind: ReflectionKind.method,
    name: serializedType.name,
    typeName: serializedType.typeName || undefined,
    abstract: serializedType.abstract ? true : undefined,
    return: serializedType.return.id,
    visibility:
      serializedType.visibility === CapnpReflectionVisibility.PUBLIC
        ? ReflectionVisibility.public
        : serializedType.visibility === CapnpReflectionVisibility.PROTECTED
          ? ReflectionVisibility.protected
          : ReflectionVisibility.private,
    parameters: serializedType._hasParameters()
      ? serializedType.parameters.map(parameter =>
          convertFromCapnpParameter(parameter)
        )
      : []
  };

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 */
export function convertToCapnpClassType(
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpClassType(
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
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTagsReflection(serializedType)
  };

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 */
export function convertToCapnpObjectLiteral(
  serializedType: SerializedTypeObjectLiteral,
  result: CapnpSerializedTypeObjectLiteral
): CapnpSerializedTypeObjectLiteral {
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpObjectLiteral(
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
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTagsReflection(serializedType)
  };

  return result;
}

/**
 * Converts a Deepkit serialized type to a Cap'n Proto serialized type.
 *
 * @param serializedType - The [Deepkit](https://deepkit.io/) {@link SerializedType | serialized type} to convert
 * @param result - The {@link capnp.List | list} object defined in a [Cap'n Proto](https://capnproto.org/) schema to write the converted type to
 */
export function convertToCapnpParameter(
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
    convertToCapnpDefault(serializedType.default, defaultValue);
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
    convertToCapnpIndexAccessOrigin(
      indexAccessOrigin,
      serializedType.indexAccessOrigin
    );
  }

  if (serializedType.tags) {
    const tags = result._initTags();
    convertToCapnpTagsReflection(tags, serializedType.tags);
  }

  return result;
}

export function convertFromCapnpParameter(
  serializedType: CapnpSerializedTypeParameter
): SerializedTypeParameter {
  const result: SerializedTypeParameter = {
    kind: ReflectionKind.parameter,
    typeName: serializedType.typeName || undefined,
    name: serializedType.name,
    default: convertFromCapnpDefault(serializedType.default),
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
    indexAccessOrigin: convertFromCapnpIndexAccessOrigin(serializedType),
    tags: convertFromCapnpTagsReflection(serializedType)
  };

  return result;
}
