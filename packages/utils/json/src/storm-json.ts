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

// import { Decimal } from "decimal.js";
import { isObject } from "@storm-stack/types/type-checks/is-object";
import { isString } from "@storm-stack/types/type-checks/is-string";
import { Buffer } from "buffer/";
import { parse, ParseError } from "jsonc-parser";
import SuperJSON from "superjson";
import { formatParseError } from "./format/parse-error";
import type {
  Class,
  JsonParseOptions,
  JsonParserResult,
  JsonSerializeOptions,
  JsonValue
} from "./types";

/**
 * A static JSON parser class used by Storm Software to serialize and deserialize JSON data
 *
 * @remarks
 * This class uses the [SuperJSON](https://github.com/blitz-js/superjson) library under the hood.
 */
export class StormJSON extends SuperJSON {
  static #instance: StormJSON;

  public static get instance(): StormJSON {
    if (!StormJSON.#instance) {
      StormJSON.#instance = new StormJSON();
    }

    return StormJSON.#instance;
  }

  /**
   * Deserialize the given value with superjson using the given metadata
   */
  public static override deserialize<TData = unknown>(
    payload: JsonParserResult
  ): TData {
    return StormJSON.instance.deserialize(payload);
  }

  /**
   * Serialize the given value with superjson
   */
  public static override serialize(object: JsonValue): JsonParserResult {
    return StormJSON.instance.serialize(object);
  }

  /**
   * Parse the given value with superjson using the given metadata
   */
  public static override parse<TData = unknown>(strData: string): TData {
    return StormJSON.instance.parse(strData);
  }

  /**
   * Stringify the given value with superjson
   */
  public static override stringify(json: any): string {
    return StormJSON.instance.stringify(json);
  }

  /**
   * Serializes the given data to a JSON string.
   * By default the JSON string is formatted with a 2 space indentation to be easy readable.
   *
   * @param json - Object which should be serialized to JSON
   * @param options - JSON serialize options
   * @returns the formatted JSON representation of the object
   */
  public static stringifyJsonFile(
    json: any,
    options?: JsonSerializeOptions
  ): string {
    return JSON.stringify(json, null, options?.spaces ?? 2);
  }

  /**
   * Parses the given JSON string and returns the object the JSON content represents.
   * By default javascript-style comments and trailing commas are allowed.
   *
   * @param strData - JSON content as string
   * @param options - JSON parse options
   * @returns Object the JSON content represents
   */
  public static parseJsonFile<TData = unknown>(
    strData: string,
    options?: JsonParseOptions
  ): TData {
    try {
      if (options?.expectComments === false) {
        return StormJSON.instance.parse(strData);
      }
    } catch {
      // Do nothing
    }

    const errors: ParseError[] = [];
    const opts = { allowTrailingComma: true, ...options };
    const result: TData = parse(strData, errors, opts);

    if (errors.length > 0 && errors[0]) {
      throw new Error(formatParseError(strData, errors[0]));
    }

    return result;
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
    StormJSON.instance.registerCustom<TData, TJsonObject>(
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
    StormJSON.instance.registerClass(classConstructor, {
      identifier: isString(options)
        ? options
        : options?.identifier || classConstructor.name,
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
  }
}

StormJSON.instance.registerCustom<Buffer, string>(
  {
    isApplicable: (v): v is Buffer => Buffer.isBuffer(v),
    serialize: v => v.toString("base64"),
    deserialize: v => Buffer.from(v, "base64")
  },
  "Bytes"
);
