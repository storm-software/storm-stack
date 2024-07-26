/**
 * Check if the provided value is a {@link https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25 | React Element}.
 *
 * @param value - The value to type check
 * @returns An indicator specifying if the value provided is of type {@link https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25 | React Element}
 */
export const isReactElement = (value: any) => {
  return (
    value.$$typeof ===
    (typeof Symbol === "function" && Symbol.for
      ? Symbol.for("react.element")
      : 0xea_c7)
  );
};
