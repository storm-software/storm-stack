/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Decimal } from "decimal.js";
import {
  registerCustom,
  deserialize as superDeserialize,
  parse as superParse,
  serialize as superSerialize,
  stringify as superStringify
} from "superjson";
import { JsonParserResult, JsonValue } from "./types";

/**
 * Stringify the given value with superjson
 */
export function stringify(json: any): string {
  return superStringify(json);
}

/**
 * Parse the given value with superjson using the given metadata
 */
export function parse<TData = unknown>(strData: string): TData {
  return superParse<TData>(strData);
}

/**
 * Serialize the given value with superjson
 */
export function serialize(object: JsonValue): JsonParserResult {
  return superSerialize(object);
}

/**
 * Deserialize the given value with superjson using the given metadata
 */
export function deserialize<TData = unknown>(payload: JsonParserResult): TData {
  return superDeserialize(payload);
}

export function register<
  TData = any,
  TJsonObject extends JsonValue = JsonValue
>(
  name: string,
  serialize: (data: TData) => TJsonObject,
  deserialize: (json: TJsonObject) => TData,
  isApplicable: (data: any) => data is TData
) {
  return registerCustom<TData, TJsonObject>(
    { isApplicable, serialize, deserialize },
    name
  );
}

/*register(
  "Decimal",
  (value: Decimal) => value.toJSON(),
  (strValue: string) => new Decimal(strValue),
  (value: any): value is Decimal => Decimal.isDecimal(value)
);*/

// register("DateTime", DateTime.toString, DateTime.create, isDateTime);

// register("StormError", StormError.stringify, StormError.parse, isStormError);

register<Buffer, string>(
  "Bytes",
  v => v.toString("base64"),
  v => Buffer.from(v, "base64"),
  (v): v is Buffer => Buffer.isBuffer(v)
);
