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

import { MultiThemeColors } from "@storm-software/config/types";
import { upperCaseFirst } from "@stryke/string-format/upper-case-first";
import { CLIPluginContext } from "../types/plugin";

const ANSI_BACKGROUND_OFFSET = 10;

export const modifiers = {
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

export const colors = {
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

export const bgColors = {
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
  (offset = 0) =>
  code =>
    `\\u001b[${code + offset}m`;

const wrapAnsi256 =
  (offset = 0) =>
  code =>
    `\\u001b[${38 + offset};5;${code}m`;

const wrapAnsi16m =
  (offset = 0) =>
  (red, green, blue) =>
    `\\u001b[${38 + offset};2;${red};${green};${blue}m`;

export type BaseAnsiStyles = Record<
  "ansi16" | "ansi256" | "ansi16m",
  Record<
    keyof typeof modifiers | keyof typeof colors | keyof typeof bgColors,
    { open: string; close: string }
  >
>;

export type CustomAnsiStyles = Record<
  "ansi16" | "ansi256" | "ansi16m",
  Record<
    | keyof Omit<MultiThemeColors["dark"], "gradient">
    | `bg${Capitalize<keyof Omit<MultiThemeColors["dark"], "gradient">>}`,
    { open: string; close: string }
  >
>;

export type AnsiStyles = BaseAnsiStyles & CustomAnsiStyles;

export function getStyles(context: CLIPluginContext): AnsiStyles {
  const output = { ansi16: {}, ansi256: {}, ansi16m: {} } as AnsiStyles;

  for (const [key, value] of Object.entries(modifiers)) {
    output.ansi16[key] = {
      open: wrapAnsi16()(value[0]),
      close: wrapAnsi16()(value[1])
    };

    output.ansi256[key] = {
      open: wrapAnsi16()(value[0]),
      close: wrapAnsi16()(value[1])
    };

    output.ansi16m[key] = {
      open: wrapAnsi16()(value[0]),
      close: wrapAnsi16()(value[1])
    };
  }

  for (const [key, value] of Object.entries(colors)) {
    output.ansi16[key] = {
      open: wrapAnsi16()(value[0]),
      close: wrapAnsi16()(value[1])
    };

    output.ansi256[key] = {
      open: wrapAnsi16()(value[0]),
      close: wrapAnsi16()(value[1])
    };

    output.ansi16m[key] = {
      open: wrapAnsi16()(value[0]),
      close: wrapAnsi16()(value[1])
    };
  }

  for (const [key, value] of Object.entries(bgColors)) {
    output.ansi16[key] = {
      open: wrapAnsi16(ANSI_BACKGROUND_OFFSET)(value[0]),
      close: wrapAnsi16(ANSI_BACKGROUND_OFFSET)(value[1])
    };

    output.ansi256[key] = {
      open: wrapAnsi16(ANSI_BACKGROUND_OFFSET)(value[0]),
      close: wrapAnsi16(ANSI_BACKGROUND_OFFSET)(value[1])
    };

    output.ansi16m[key] = {
      open: wrapAnsi16(ANSI_BACKGROUND_OFFSET)(value[0]),
      close: wrapAnsi16(ANSI_BACKGROUND_OFFSET)(value[1])
    };
  }

  for (const [key, value] of Object.entries(
    context.options.plugins.cli.colors
  ).filter(([key]: [string, string | string[]]) => key !== "gradient") as Array<
    [string, string]
  >) {
    output.ansi16[key] = {
      open: wrapAnsi16()(hexToAnsi(value)),
      close: wrapAnsi16()(39)
    };
    output.ansi16[`bg${upperCaseFirst(key)}`] = {
      open: wrapAnsi16(ANSI_BACKGROUND_OFFSET)(hexToAnsi(value)),
      close: wrapAnsi16(ANSI_BACKGROUND_OFFSET)(49)
    };

    output.ansi256[key] = {
      open: wrapAnsi256()(hexToAnsi256(value)),
      close: wrapAnsi16()(39)
    };
    output.ansi256[`bg${upperCaseFirst(key)}`] = {
      open: wrapAnsi256(ANSI_BACKGROUND_OFFSET)(hexToAnsi256(value)),
      close: wrapAnsi16(ANSI_BACKGROUND_OFFSET)(49)
    };

    output.ansi16m[key] = {
      open: wrapAnsi16m()(...hexToRgb(value)),
      close: wrapAnsi16()(39)
    };
    output.ansi16m[`bg${upperCaseFirst(key)}`] = {
      open: wrapAnsi16m(ANSI_BACKGROUND_OFFSET)(...hexToRgb(value)),
      close: wrapAnsi16(ANSI_BACKGROUND_OFFSET)(49)
    };
  }

  return output;
}

function rgbToAnsi256(red: number, green: number, blue: number): number {
  if (red === green && green === blue) {
    if (red < 8) {
      return 16;
    }

    if (red > 248) {
      return 231;
    }

    return Math.round(((red - 8) / 247) * 24) + 232;
  }

  return (
    16 +
    36 * Math.round((red / 255) * 5) +
    6 * Math.round((green / 255) * 5) +
    Math.round((blue / 255) * 5)
  );
}

function hexToRgb(hex: string | number): [number, number, number] {
  const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
  if (!matches) {
    return [0, 0, 0];
  }

  let [colorString] = matches;

  if (colorString.length === 3) {
    colorString = [...colorString]
      .map(character => character + character)
      .join("");
  }

  const integer = Number.parseInt(colorString, 16);

  return [(integer >> 16) & 0xff, (integer >> 8) & 0xff, integer & 0xff];
}

function hexToAnsi256(hex: string | number): number {
  return rgbToAnsi256(...hexToRgb(hex));
}

function ansi256ToAnsi(code: number): number {
  if (code < 8) {
    return 30 + code;
  }

  if (code < 16) {
    return 90 + (code - 8);
  }

  let red;
  let green;
  let blue;

  if (code >= 232) {
    red = ((code - 232) * 10 + 8) / 255;
    green = red;
    blue = red;
  } else {
    code -= 16;

    const remainder = code % 36;

    red = Math.floor(code / 36) / 5;
    green = Math.floor(remainder / 6) / 5;
    blue = (remainder % 6) / 5;
  }

  const value = Math.max(red, green, blue) * 2;

  if (value === 0) {
    return 30;
  }

  let result =
    30 + ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red));

  if (value === 2) {
    result += 60;
  }

  return result;
}

// function rgbToAnsi(red: number, green: number, blue: number): number {
//   return ansi256ToAnsi(rgbToAnsi256(red, green, blue));
// }

function hexToAnsi(hex: string | number): number {
  return ansi256ToAnsi(hexToAnsi256(hex));
}
