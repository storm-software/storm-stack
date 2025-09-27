/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

declare module "@alloy-js/babel-preset" {
  /**
   * Babel preset for Alloy JS projects.
   *
   * @param options - Options to configure the preset.
   * @returns A Babel configuration object.
   */
  function alloyBabelPreset(options?: any): any;

  export default alloyBabelPreset;
}

declare module "@alloy-js/babel-plugin-jsx-dom-expressions" {
  /**
   * Babel plugin to transform JSX using DOM expressions for Alloy JS.
   *
   * @param options - Options to configure the plugin.
   * @returns A Babel plugin object.
   */
  function jsxDomExpressionsPlugin(options?: any): any;

  export default jsxDomExpressionsPlugin;
}

declare module "@alloy-js/babel-plugin" {
  /**
   * General Babel plugin for Alloy JS projects.
   *
   * @param options - Options to configure the plugin.
   * @returns A Babel plugin object.
   */
  function alloyBabelPlugin(options?: any): any;

  export default alloyBabelPlugin;
}
