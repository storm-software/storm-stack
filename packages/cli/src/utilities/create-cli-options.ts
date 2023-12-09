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
