/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "*.svg" {
  const content: any;
  export const ReactComponent: any;
  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
  export default content;
}
