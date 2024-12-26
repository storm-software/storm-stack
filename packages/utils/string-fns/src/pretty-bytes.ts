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

export interface Options {
  /**
   * Include plus sign for positive numbers. If the difference is exactly zero a space character will be prepended instead for better alignment.
   *
   * @defaultValue false
   * */
  readonly signed?: boolean;

  /**
   * - If `false`: Output won't be localized.
   * - If `true`: Localize the output using the system/browser locale.
   * - If `string`: Expects a [BCP 47 language tag](https://en.wikipedia.org/wiki/IETF_language_tag) (For example: `en`, `de`, …)
   * - If `string[]`: Expects a list of [BCP 47 language tags](https://en.wikipedia.org/wiki/IETF_language_tag) (For example: `en`, `de`, …)
   *
   * @defaultValue false
   */
  readonly locale?: boolean | string | readonly string[];

  /**
   * Format the number as [bits](https://en.wikipedia.org/wiki/Bit) instead of [bytes](https://en.wikipedia.org/wiki/Byte). This can be useful when, for example, referring to [bit rate](https://en.wikipedia.org/wiki/Bit_rate).
   *
   * @defaultValue false
   *
   * @example
   * ```ts
   * import { prettyBytes } from '@storm-stack/string-fns/pretty-bytes';
   *
   * prettyBytes(1337, {bits: true});
   * //=> '1.34 kbit'
   * ```
   */
  readonly bits?: boolean;

  /**
   * Format the number using the [Binary Prefix](https://en.wikipedia.org/wiki/Binary_prefix) instead of the [SI Prefix](https://en.wikipedia.org/wiki/SI_prefix). This can be useful for presenting memory amounts. However, this should not be used for presenting file sizes.
   *
   * @defaultValue false
   *
   * @example
   * ```ts
   * import { prettyBytes } from '@storm-stack/string-fns/pretty-bytes';
   *
   * prettyBytes(1000, {binary: true});
   * //=> '1000 bit'
   *
   * prettyBytes(1024, {binary: true});
   * //=> '1 kiB'
   * ```
   */
  readonly binary?: boolean;

  /**
   * The minimum number of fraction digits to display.
   *
   * If neither `minimumFractionDigits` or `maximumFractionDigits` are set, the default behavior is to round to 3 significant digits.
   *
   * @defaultValue undefined
   *
   * @example
   * ```ts
   * import { prettyBytes } from '@storm-stack/string-fns/pretty-bytes';
   *
   * // Show the number with at least 3 fractional digits
   * prettyBytes(1900, {minimumFractionDigits: 3});
   * //=> '1.900 kB'
   *
   * prettyBytes(1900);
   * //=> '1.9 kB'
   * ```
   */
  readonly minimumFractionDigits?: number;

  /**
   * The maximum number of fraction digits to display.
   *
   * If neither `minimumFractionDigits` or `maximumFractionDigits` are set, the default behavior is to round to 3 significant digits.
   *
   * @defaultValue undefined
   *
   * @example
   * ```ts
   * import { prettyBytes } from '@storm-stack/string-fns/pretty-bytes';
   *
   * // Show the number with at most 1 fractional digit
   * prettyBytes(1920, {maximumFractionDigits: 1});
   * //=> '1.9 kB'
   *
   * prettyBytes(1920);
   * //=> '1.92 kB'
   * ```
   */
  readonly maximumFractionDigits?: number;

  /**
   * Put a space between the number and unit.
   *
   * @defaultValue true
   *
   * @example
   * ```ts
   * import { prettyBytes } from '@storm-stack/string-fns/pretty-bytes';
   *
   * prettyBytes(1920, {space: false});
   * //=> '1.9kB'
   *
   * prettyBytes(1920);
   * //=> '1.92 kB'
   * ```
   */
  readonly space?: boolean;
}

const BYTE_UNITS = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
const BIBYTE_UNITS = [
  "B",
  "KiB",
  "MiB",
  "GiB",
  "TiB",
  "PiB",
  "EiB",
  "ZiB",
  "YiB"
];
const BIT_UNITS = [
  "b",
  "kbit",
  "Mbit",
  "Gbit",
  "Tbit",
  "Pbit",
  "Ebit",
  "Zbit",
  "Ybit"
];
const BIBIT_UNITS = [
  "b",
  "kibit",
  "Mibit",
  "Gibit",
  "Tibit",
  "Pibit",
  "Eibit",
  "Zibit",
  "Yibit"
];

/**
 * Formats the given number using `Number#toLocaleString`.
 *
 * @remarks
 * - If locale is a string, the value is expected to be a locale-key (for example: `de`).
 * - If locale is true, the system default locale is used for translation.
 * - If no value for locale is specified, the number is returned unmodified.
 *
 * @param number - The number to format.
 * @param locale - The locale to use for formatting the number.
 * @param options - The options to use for formatting the number.
 * @returns The formatted number.
 */
export const toLocaleString = (
  number?: number | string,
  locale?: string | readonly string[] | boolean,
  options: Options = {}
): string => {
  let result = number;
  let _locale = locale;
  if (typeof _locale === "string") {
    if (!_locale) {
      _locale = process.env.STORM_LOCALE || "en-US";
    }
    if (Array.isArray(_locale)) {
      result = number?.toLocaleString(_locale, options);
    }
  } else if (_locale === true || options !== undefined) {
    result = number?.toLocaleString(undefined, options);
  }

  return String(result);
};

/**
 * Convert bytes to a human readable string: `1337` → `1.34 kB`.
 *
 * @param number - The number to format.
 *
 * @example
 * ```ts
 * import { prettyBytes } from '@storm-stack/string-fns/pretty-bytes';
 *
 * prettyBytes(1337);
 * //=> '1.34 kB'
 *
 * prettyBytes(100);
 * //=> '100 B'
 *
 * // Display file size differences
 * prettyBytes(42, {signed: true});
 * //=> '+42 B'
 *
 * // Localized output using German locale
 * prettyBytes(1337, {locale: 'de'});
 * //=> '1,34 kB'
 * ```
 *
 * @param number - The number to format.
 * @param options - The options to use.
 * @returns The formatted string.
 */
export function prettyBytes(number: number, options?: Options): string {
  let _number: string | number = number;
  if (!Number.isFinite(_number)) {
    throw new TypeError(
      `Expected a finite number, got ${typeof _number}: ${_number}`
    );
  }

  const opts = {
    bits: false,
    binary: false,
    space: true,
    ...options
  };

  const UNITS = opts.bits
    ? opts.binary
      ? BIBIT_UNITS
      : BIT_UNITS
    : opts.binary
      ? BIBYTE_UNITS
      : BYTE_UNITS;

  const separator = opts.space ? " " : "";

  if (opts.signed && _number === 0) {
    return ` 0${separator}${UNITS[0]}`;
  }

  const isNegative = _number < 0;

  const prefix = isNegative ? "-" : opts.signed ? "+" : "";

  if (isNegative) {
    _number = -_number;
  }

  let localeOptions;

  if (opts.minimumFractionDigits !== undefined) {
    localeOptions = { minimumFractionDigits: opts.minimumFractionDigits };
  }

  if (opts.maximumFractionDigits !== undefined) {
    localeOptions = {
      maximumFractionDigits: opts.maximumFractionDigits,
      ...localeOptions
    };
  }

  if (_number < 1) {
    const numberString = toLocaleString(_number, opts.locale, localeOptions);
    return prefix + numberString + separator + UNITS[0];
  }

  const exponent = Math.min(
    Math.floor(
      opts.binary ? Math.log(_number) / Math.log(1024) : Math.log10(_number) / 3
    ),
    UNITS.length - 1
  );
  _number /= (opts.binary ? 1024 : 1000) ** exponent;

  if (!localeOptions) {
    _number = _number.toPrecision(3);
  }

  const numberString = toLocaleString(
    Number(_number),
    opts.locale,
    localeOptions
  );

  const unit = UNITS[exponent];

  return prefix + numberString + separator + unit;
}
