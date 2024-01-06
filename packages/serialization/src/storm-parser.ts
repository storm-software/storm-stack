/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Decimal } from "decimal.js";
import { isObject, isString } from "@storm-stack/utilities";
import SuperJSON from "superjson";
import { Class, JsonParserResult, JsonValue } from "./types";

function _register<TData = any, TJsonObject extends JsonValue = JsonValue>(
  name: string,
  serialize: (data: TData) => TJsonObject,
  deserialize: (json: TJsonObject) => TData,
  isApplicable: (data: any) => data is TData
) {
  return SuperJSON.registerCustom<TData, TJsonObject>(
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

/**
 * A static JSON parser class used by Storm Software to serialize and deserialize JSON
 *
 * @remarks
 * This class uses the {@link https://github.com/blitz-js/superjson | SuperJSON} library
 */
export class StormParser extends SuperJSON {
  private static _instance: StormParser;

  public static get instance(): StormParser {
    if (!StormParser._instance) {
      StormParser._instance = new StormParser();
    }

    return StormParser._instance;
  }

  /**
   * Deserialize the given value with superjson using the given metadata
   */
  public static override deserialize<TData = unknown>(
    payload: JsonParserResult
  ): TData {
    return StormParser.instance.deserialize(payload);
  }

  /**
   * Serialize the given value with superjson
   */
  public static override serialize(object: JsonValue): JsonParserResult {
    return StormParser.instance.serialize(object);
  }

  /**
   * Parse the given value with superjson using the given metadata
   */
  public static override parse<TData = unknown>(strData: string): TData {
    return StormParser.instance.parse(strData);
  }

  /**
   * Stringify the given value with superjson
   */
  public static override stringify(json: any): string {
    return StormParser.instance.stringify(json);
  }

  /**
   * Register a custom schema with superjson
   *
   * @param name - The name of the schema
   * @param serialize - The function to serialize the schema
   * @param deserialize - The function to deserialize the schema
   * @param isApplicable - The function to check if the schema is applicable
   */
  public static register<
    TData = any,
    TJsonObject extends JsonValue = JsonValue
  >(
    name: string,
    serialize: (data: TData) => TJsonObject,
    deserialize: (json: TJsonObject) => TData,
    isApplicable: (data: any) => data is TData
  ) {
    StormParser.instance.registerCustom<TData, TJsonObject>(
      { isApplicable, serialize, deserialize },
      name
    );
  }

  /**
   * Register a class with superjson
   *
   * @param classConstructor - The class constructor to register
   */
  public static override registerClass(
    classConstructor: Class,
    options?: { identifier?: string; allowProps?: string[] } | string
  ) {
    StormParser.instance.registerClass(classConstructor, {
      identifier: isString(options)
        ? options
        : options?.identifier
          ? options?.identifier
          : classConstructor.name,
      allowProps:
        options &&
        isObject(options) &&
        options?.allowProps &&
        Array.isArray(options.allowProps)
          ? options.allowProps
          : ["__typename"]
    });
  }

  private constructor() {
    super({ dedupe: true });

    _register<Buffer, string>(
      "Bytes",
      v => v.toString("base64"),
      v => Buffer.from(v, "base64"),
      (v): v is Buffer => Buffer.isBuffer(v)
    );
  }
}

/*export const registerClass = StormParser.registerClass;
export const register = StormParser.register;
export const deserialize = StormParser.deserialize;
export const serialize = StormParser.serialize;
export const parse = StormParser.parse;
export const stringify = StormParser.stringify;*/
