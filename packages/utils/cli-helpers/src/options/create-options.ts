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
 * Create CLI options from an object.
 *
 * @param obj - The object to create CLI options from
 * @returns The CLI options
 */
export function createCliOptions(
  obj: Record<string, string | number | boolean>
): string[] {
  return Object.entries(obj).reduce(
    (ret: string[], [key, value]: [string, string | number | boolean]) => {
      if (value !== undefined) {
        const kebabCase = key.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
        ret.push(`--${kebabCase}=${value}`);
      }
      return ret;
    },
    [] as string[]
  );
}

/**
 * Create CLI options from an object and join them into a string.
 *
 * @param obj - The object to create CLI options from
 * @returns The CLI options as a string
 */
export function createCliOptionsString(
  obj: Record<string, string | number | boolean>
): string {
  return createCliOptions(obj).join(" ");
}
