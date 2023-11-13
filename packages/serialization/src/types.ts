import { TypedCheckedClass } from "@storm-software/utilities/types";

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
  | Symbol
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
export type LeafTypeAnnotation =
  | PrimitiveTypeAnnotation
  | "regexp"
  | "Date"
  | "Error"
  | "URL";

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
    values?:
      | Tree<TypeAnnotation>
      | Record<string, Tree<TypeAnnotation>>
      | undefined;
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

export interface SerializableClass {
  /**
   * Serialize the class to a JSON object
   */
  serialize(): JsonValue;

  /**
   * Deserialize the class from a JSON object
   *
   * @param json - The JSON object to deserialize from
   */
  deserialize(json: JsonValue): void;
}

export type ClassMetadata<T> = SerializableClass & TypedCheckedClass<T>;
