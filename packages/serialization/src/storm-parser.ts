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
import { isObject, isString } from "@storm-stack/types";
import { Buffer } from "buffer/";
import SuperJSON from "superjson";
import type { Class, JsonParserResult, JsonValue } from "./types";

/**
 * A static JSON parser class used by Storm Software to serialize and deserialize JSON
 *
 * @remarks
 * This class uses the [SuperJSON](https://github.com/blitz-js/superjson) library
 *
 * @class StormParser
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

StormParser.instance.registerCustom<Buffer, string>(
  {
    isApplicable: (v): v is Buffer => Buffer.isBuffer(v),
    serialize: v => v.toString("base64"),
    deserialize: v => Buffer.from(v, "base64")
  },
  "Bytes"
);
