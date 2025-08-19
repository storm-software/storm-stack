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

const ANSI_BACKGROUND_OFFSET = 10;

const modifiers = {
  reset: [0, 0],
  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  overline: [53, 55],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29]
};

const colors = {
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],

  // Bright color
  blackBright: [90, 39],
  gray: [90, 39],
  grey: [90, 39],
  redBright: [91, 39],
  greenBright: [92, 39],
  yellowBright: [93, 39],
  blueBright: [94, 39],
  magentaBright: [95, 39],
  cyanBright: [96, 39],
  whiteBright: [97, 39]
};

const bgColors = {
  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],

  // Bright color
  bgBlackBright: [100, 49],
  bgGray: [100, 49],
  bgGrey: [100, 49],
  bgRedBright: [101, 49],
  bgGreenBright: [102, 49],
  bgYellowBright: [103, 49],
  bgBlueBright: [104, 49],
  bgMagentaBright: [105, 49],
  bgCyanBright: [106, 49],
  bgWhiteBright: [107, 49]
};

const wrapAnsi16 =
  (offset = 0, modifier?: number) =>
  code =>
    `\\u001B[${modifier ? `${modifier};` : ""}${code + offset}m`;

export function getStyles() {
  const output = {} as Record<
    keyof typeof modifiers | keyof typeof colors | keyof typeof bgColors,
    { open: string; close: string }
  >;

  for (const [key, value] of Object.entries(modifiers)) {
    output[key] = {
      open: wrapAnsi16()(value[0]),
      close: wrapAnsi16()(value[1])
    };
  }

  for (const [key, value] of Object.entries(colors)) {
    output[key] = {
      open: wrapAnsi16()(value[0]),
      close: wrapAnsi16()(value[1])
    };
  }

  for (const [key, value] of Object.entries(bgColors)) {
    output[key] = {
      open: wrapAnsi16(ANSI_BACKGROUND_OFFSET)(value[0]),
      close: wrapAnsi16(ANSI_BACKGROUND_OFFSET)(value[1])
    };
  }

  return output;
}
