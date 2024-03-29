/**
 * Check if the provided value's type is `Function`
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type `Function`
 */
export const isFunction = (
  value: unknown
): value is ((params?: unknown) => unknown) & ((args?: any[]) => any) => {
  try {
    return (
      value instanceof Function ||
      typeof value === "function" ||
      !!(value?.constructor && (value as any)?.call && (value as any)?.apply)
    );
  } catch (_) {
    return false;
  }
};
