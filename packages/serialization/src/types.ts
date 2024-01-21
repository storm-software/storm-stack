import type { ClassTypeCheckable, ITyped } from "@storm-stack/utilities";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type PrimitiveJsonValue = string | number | boolean | undefined | null;

export type Class = {
  new (...args: any[]): any;
};

export type JsonValue = PrimitiveJsonValue | JsonArray | JsonObject;

export interface JsonArray extends Array<JsonValue> {}

export interface JsonObject {
  [key: string]: JsonValue;
}

export type ClassInstance = any;

export type SerializableJsonValue =
  | symbol
  | Set<JsonValue>
  | Map<JsonValue, JsonValue>
  | undefined
  | bigint
  | Date
  | ClassInstance
  | RegExp;

export type Tree<T> = InnerNode<T> | Leaf<T>;
export type Leaf<T> = [T];
export type InnerNode<T> = [T, Record<string, Tree<T>>];

export type PrimitiveTypeAnnotation = "number" | "undefined" | "bigint";
export type LeafTypeAnnotation = PrimitiveTypeAnnotation | "regexp" | "Date" | "Error" | "URL";

export type TypedArrayAnnotation = ["typed-array", string];
export type ClassTypeAnnotation = ["class", string];
export type SymbolTypeAnnotation = ["symbol", string];
export type CustomTypeAnnotation = ["custom", string];
export type SimpleTypeAnnotation = LeafTypeAnnotation | "map" | "set";
export type CompositeTypeAnnotation =
  | TypedArrayAnnotation
  | ClassTypeAnnotation
  | SymbolTypeAnnotation
  | CustomTypeAnnotation;
export type TypeAnnotation = SimpleTypeAnnotation | CompositeTypeAnnotation;

export interface JsonParserResult {
  json: JsonValue;
  meta?: {
    values?: Tree<TypeAnnotation> | Record<string, Tree<TypeAnnotation>> | undefined;
    referentialEqualities?:
      | Record<string, string[]>
      | [string[]]
      | [string[], Record<string, string[]>];
  };
}

export interface IJsonParser {
  parse: <TData = any>(strData: string) => TData;
  stringify: <TData = any>(data: TData) => string;
  serialize: (object: JsonValue) => JsonParserResult;
  deserialize: <TData = any>(payload: JsonParserResult) => TData;

  register: <TData = any, TJsonValue extends JsonValue = JsonValue>(
    name: string,
    serialize: (object: JsonValue) => TJsonValue,
    deserialize: (payload: TJsonValue) => TData,
    isApplicable: (data: any) => data is TData
  ) => void;
}

/**
 * A function that can serialize a certain type of data
 *
 * @param data - The data object to serialize
 * @returns The serialized JSON object
 */
export type SerializationFunct<TData = any, TJsonValue extends JsonValue = JsonValue> = (
  data: TData
) => TJsonValue;

/**
 * A function that can deserialize a certain type of data
 *
 * @param json - The JSON object to deserialize from
 * @returns The deserialized data
 */
export type DeserializeFunct<TData = any, TJsonValue extends JsonValue = JsonValue> = (
  json: TJsonValue
) => TData;

/**
 * A class that can be serialized and deserialized
 */
export interface DataTransformer<TData, TJsonValue extends JsonValue = JsonValue> {
  /**
   * Serialize the class to a JSON object
   *
   * @param data - The data object to serialize
   * @returns The serialized JSON object
   */
  serialize: SerializationFunct<TData, TJsonValue>;

  /**
   * Deserialize the class from a JSON object
   *
   * @param json - The JSON object to deserialize from
   * @returns The deserialized data
   */
  deserialize: DeserializeFunct<TData, TJsonValue>;
}

/**
 * A class that can be serialized and deserialized
 */
export interface ClassSerializable<_TData, TJsonValue extends JsonValue = JsonValue> {
  /**
   * Serialize the class to a JSON object
   *
   * @returns The data object to serialize
   */
  serialize: () => JsonParserResult;

  /**
   * Deserialize the class from a JSON object
   *
   * @param json - The JSON object to deserialize from
   */
  deserialize: (json: TJsonValue) => void;
}

export type SerializableType<T> = ClassSerializable<T> & ClassTypeCheckable<T> & ITyped & T;

export type SerializationMetadata<T> = DataTransformer<T> & ClassTypeCheckable<T>;
