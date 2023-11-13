/* eslint-disable @typescript-eslint/no-explicit-any */
import { isString, isTyped } from "@storm-software/utilities";
import { parse, stringify } from "qs";
import { JsonValue } from "./types";

/**
 * Stringify the given value with qs
 */
export function stringifyQueryParam(
  json: JsonValue,
  options?: {
    delimiter?: string | undefined;
    strictNullHandling?: boolean | undefined;
    skipNulls?: boolean | undefined;
    encode?: boolean | undefined;
    filter?:
      | Array<string | number>
      | ((prefix: string, value: any) => any)
      | undefined;
    arrayFormat?: "indices" | "brackets" | "repeat" | "comma" | undefined;
    indices?: boolean | undefined;
    sort?: ((a: any, b: any) => number) | undefined;
    serializeDate?: ((d: Date) => string) | undefined;
    format?: "RFC1738" | "RFC3986" | undefined;
    encodeValuesOnly?: boolean | undefined;
    addQueryPrefix?: boolean | undefined;
    charset?: "utf-8" | "iso-8859-1" | undefined;
    allowDots?: boolean | undefined;
    charsetSentinel?: boolean | undefined;
  }
): string {
  return stringify(json, {
    delimiter: "&",
    encode: true,
    skipNulls: false,
    arrayFormat: "brackets",
    format: "RFC1738",
    addQueryPrefix: true,
    charset: "utf-8",
    allowDots: true,
    sort,
    ...options
  });
}

/**
 * Parse the given value with qs using the given metadata
 */
export function parseQueryParam<TData = unknown>(
  strData: string,
  options?: {
    comma?: boolean | undefined;
    delimiter?: string | RegExp | undefined;
    depth?: number | false | undefined;
    arrayLimit?: number | undefined;
    parseArrays?: boolean | undefined;
    allowDots?: boolean | undefined;
    plainObjects?: boolean | undefined;
    allowPrototypes?: boolean | undefined;
    parameterLimit?: number | undefined;
    strictNullHandling?: boolean | undefined;
    ignoreQueryPrefix?: boolean | undefined;
    charset?: "utf-8" | "iso-8859-1" | undefined;
    charsetSentinel?: boolean | undefined;
    interpretNumericEntities?: boolean | undefined;
  }
): TData {
  return parse(strData, {
    delimiter: "&",
    depth: 5,
    parseArrays: true,
    charset: "utf-8",
    allowDots: true,
    plainObjects: true,
    ignoreQueryPrefix: true,
    ...options
  }) as TData;
}

/**
 * Parse the given value with qs using the given metadata
 */
function sort(a: any, b: any): number {
  if (isTyped(a) && isTyped(b)) {
    return a.__typename.localeCompare(b.__typename);
  }
  if (isString(a) && isString(b)) {
    return a.localeCompare(b);
  }

  return 0;
}
