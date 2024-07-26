/**
 * Check if two values are equal
 *
 * @param x - The first value to compare
 * @param y - The second value to compare
 * @returns A boolean indicating if the two values are equal
 */
export const isEqual = <TType>(x: TType, y: TType): boolean => {
  if (Object.is(x, y)) return true;
  if (x instanceof Date && y instanceof Date) {
    return x.getTime() === y.getTime();
  }
  if (x instanceof RegExp && y instanceof RegExp) {
    return x.toString() === y.toString();
  }
  if (
    typeof x !== "object" ||
    x === null ||
    typeof y !== "object" ||
    y === null
  ) {
    return false;
  }
  const keysX = Reflect.ownKeys(x as unknown as object) as (keyof typeof x)[];
  const keysY = Reflect.ownKeys(y as unknown as object);
  if (keysX.length !== keysY.length) return false;
  for (const element_ of keysX) {
    if (!Reflect.has(y as unknown as object, element_)) return false;
    if (!isEqual(x[element_], y[element_])) return false;
  }
  return true;
};
