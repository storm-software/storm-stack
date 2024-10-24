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

import { isFunction } from "@storm-stack/types/type-checks/is-function";
import {
  type ClassTypeCheckable,
  type ITyped
} from "@storm-stack/types/utility-types";
import { StormParser } from "./storm-parser";
import type { ClassSerializable, JsonParserResult, JsonValue } from "./types";

export const Serializable = <TData = any>(options?: {
  /**
   * The type and/or name of the record
   */
  identifier?: string;
}) => {
  const decorator = <
    TClass extends new (..._args: any) => any = new (..._args: any) => TData
  >(
    target: TClass
  ) => {
    const identifier = options?.identifier || target.name;

    const isTypeOf: ClassTypeCheckable<TData>["isTypeOf"] = isFunction(
      (target.prototype as ClassTypeCheckable<TData>)?.isTypeOf
    )
      ? (target.prototype as ClassTypeCheckable<TData>).isTypeOf
      : (value: any): value is TData =>
          value instanceof target || value?.__typename === identifier;

    StormParser.registerClass(target, identifier);
    return class
      extends target
      implements ClassSerializable<TData>, ClassTypeCheckable<TData>, ITyped
    {
      /**
       * The name of the class's type
       */
      public static __typename = identifier;

      /**
       * Run type check on the given value
       * @param value - The value to check
       * @returns True if the value is of the type of the class
       */
      public static isTypeOf(value: any): value is TData {
        return isTypeOf(value);
      }

      /**
       * Deserialize the class from a JSON object
       *
       * @param json - The JSON object to deserialize from
       */
      public static deserialize = (json: JsonValue) => {
        return StormParser.serialize(json);
      };

      /**
       * Convert the stringified class to an instance of the object
       *
       * @param strObject - A stringified version of the class instance
       * @returns An instance of the class converted from the provided string
       */
      public static parse = (strObject: string): TData => {
        return StormParser.parse(strObject);
      };

      /**
       * The name of the class's type
       */
      public __typename = identifier;

      /**
       * Serialize the class to a JSON object
       *
       * @returns The data object to serialize
       */
      public serialize = (): JsonParserResult => {
        return StormParser.serialize(this);
      };

      /**
       * Deserialize the class from a JSON object
       *
       * @param json - The JSON object to deserialize from
       */

      public deserialize = (json: JsonValue) => {
        return StormParser.serialize(json);
      };

      /**
       * Convert the class instance to a string
       *
       * @returns A string version of the class instance
       */
      public stringify = (): string => {
        return StormParser.stringify(this);
      };

      /**
       * Convert the stringified class to an instance of the object
       *
       * @param strObject - A stringified version of the class instance
       * @returns An instance of the class converted from the provided string
       */

      public parse = (strObject: string): TData => {
        return StormParser.parse(strObject);
      };

      /**
       * Run type check on the given value
       * @param value - The value to check
       * @returns True if the value is of the type of the class
       */

      public isTypeOf(value: any): value is TData {
        return isTypeOf(value);
      }
    };
  };

  return decorator;
};
