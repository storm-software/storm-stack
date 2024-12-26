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

/**
 * Options passed to the `generate` function to create a snowflake identifier.
 */
export interface ISnowflakeGeneratorOptions {
  /**
   * The id of the shard running this generator.
   *
   * @defaultValue 1
   */
  shardId?: number;

  /**
   * The epoch to use for the snowflake.
   *
   * @remarks
   * This is the time in milliseconds since 1 January 1970 00:00:00 UTC.
   *
   * @defaultValue 1420070400000 (Date.UTC(1970, 0, 1).valueOf())
   */
  epoch?: number;

  /**
   * The current timestamp to use for the snowflake.
   *
   * @defaultValue Date.now()
   */
  timestamp?: number | Date;
}

/**
 * Resolvable value types for a valid Snowflake:
 * * string
 * * number
 * * bigint
 */
export type SnowflakeResolvable = string;

/**
 * A deconstructed snowflake and the details around it's creation.
 */
export interface DeconstructedSnowflake {
  /**
   * Snowflake deconstructed from
   */
  snowflake: SnowflakeResolvable;

  /**
   * The timestamp the snowflake was generated
   */
  timestamp: number;

  /**
   * The shard_id used when generating
   */
  shard_id: number;

  /**
   * The increment of this snowflake
   */
  sequence: number;

  /**
   * The 64Bit snowflake binary string
   */
  binary: string;
}

export const DEFAULT_SHARD_ID = 1;
export const DEFAULT_EPOCH: number = Date.UTC(1970, 0, 1).valueOf();

/**
 * The sequence of the current running generator.
 *
 * @defaultValue 1
 */
let sequence = 1;

/**
 * Transform a snowflake into its 64Bit binary string.
 *
 * @param snowflake - Snowflake to transform
 * @returns A 64Bit binary string
 */
function ToBinaryString(snowflake: SnowflakeResolvable): string {
  const cached64BitZeros =
    "0000000000000000000000000000000000000000000000000000000000000000";
  const binValue = BigInt(snowflake).toString(2);
  return binValue.length < 64
    ? cached64BitZeros.slice(0, Math.max(0, 64 - binValue.length)) + binValue
    : binValue;
}

/**
 * Extract bits and their values from a snowflake.
 * @param snowflake - Snowflake to extract from
 * @param shift - Number of bits to shift before extracting
 * @param length - Number of bits to extract before stopping
 * @returns A bigint value of the extracted bits
 */
function extractBits(
  snowflake: SnowflakeResolvable,
  start: number,
  length?: number
): number {
  return Number.parseInt(
    length
      ? ToBinaryString(snowflake).slice(start, start + length)
      : ToBinaryString(snowflake).slice(Math.max(0, start)),
    2
  );
}

/**
 * Generate a snowflake identifier.
 *
 * @remarks
 * Snowflakes are 64-bit unsigned integers that are roughly time-ordered.
 *
 * @example
 * ```typescript
 *
 * // Generate a snowflake with the default options
 * const id1 = snowflake();
 *
 * // Generate a snowflake with a custom shard id
 * const id2 = snowflake({ shardId: 2 });
 *
 * // Generate a snowflake with a custom shard id and timestamp
 * const id3 = snowflake({ shardId: 3, timestamp: new Date("2021-01-01") });
 *
 * ```
 *
 * @param options - The options to use when generating the snowflake
 * @returns A snowflake
 */
export function snowflake({
  shardId,
  epoch,
  timestamp
}: ISnowflakeGeneratorOptions): string {
  let result =
    (BigInt(
      timestamp
        ? timestamp instanceof Date
          ? timestamp.valueOf()
          : new Date(timestamp).valueOf()
        : Date.now()
    ) -
      BigInt(epoch ?? DEFAULT_EPOCH)) <<
    BigInt(22);

  result |= BigInt((shardId ?? DEFAULT_SHARD_ID) % 1024) << BigInt(12);
  result |= BigInt(sequence++ % 4096);

  return result.toString();
}

/**
 * Deconstruct a snowflake to its values using the `epoch`.
 *
 * @param snowflake - Snowflake to deconstruct
 * @returns Either the DeconstructedSnowflake object
 */
export function deconstructSnowflake(
  snowflake: SnowflakeResolvable
): DeconstructedSnowflake {
  const binary = ToBinaryString(snowflake);

  return {
    snowflake,
    timestamp: extractBits(snowflake, 1, 41),
    shard_id: extractBits(snowflake, 42, 10),
    sequence: extractBits(snowflake, 52),
    binary
  };
}

/**
 * Check if a snowflake string Id is valid.
 *
 * @param snowflake - Snowflake to check
 * @returns Whether the snowflake is valid
 */
export function isValidSnowflake(snowflake: string): boolean {
  if (!/^\d{19}$/.test(snowflake)) {
    return false;
  }

  try {
    deconstructSnowflake(snowflake);

    return true;
  } catch {
    return false;
  }
}
