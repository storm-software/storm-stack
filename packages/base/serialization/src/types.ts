/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

import type { JsonParserResult, JsonValue } from "@storm-stack/json/types";
import type {
  ClassTypeCheckable,
  ITyped
} from "@storm-stack/types/utility-types";

/**
 * A function that can serialize a certain type of data
 *
 * @param data - The data object to serialize
 * @returns The serialized JSON object
 */
export type SerializationFunct<
  TData = any,
  TJsonValue extends JsonValue = JsonValue
> = (data: TData) => TJsonValue;

/**
 * A function that can deserialize a certain type of data
 *
 * @param json - The JSON object to deserialize from
 * @returns The deserialized data
 */
export type DeserializeFunct<
  TData = any,
  TJsonValue extends JsonValue = JsonValue
> = (json: TJsonValue) => TData;

/**
 * A class that can be serialized and deserialized
 */
export interface DataTransformer<
  TData,
  TJsonValue extends JsonValue = JsonValue
> {
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
export interface ClassSerializable<
  _TData,
  TJsonValue extends JsonValue = JsonValue
> {
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

export type SerializableType<T> = ClassSerializable<T> &
  ClassTypeCheckable<T> &
  ITyped &
  T;

export type SerializationMetadata<T> = DataTransformer<T> &
  ClassTypeCheckable<T>;
