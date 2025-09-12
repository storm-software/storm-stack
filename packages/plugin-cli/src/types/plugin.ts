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

import { SingleThemeColors } from "@storm-software/config/types";
import {
  StandaloneApplicationResolvedOptions,
  StandaloneLibraryResolvedOptions
} from "@storm-stack/core/types/build";
import { WorkspaceConfig } from "@storm-stack/core/types/config";
import {
  Context,
  Reflection,
  ReflectionRecord
} from "@storm-stack/core/types/context";
import { DatePluginOptions } from "@storm-stack/plugin-date/types";
import { EnvPluginReflectionRecord } from "@storm-stack/plugin-env/types/plugin";
import {
  NodePluginOptions,
  NodePluginResolvedOptions
} from "@storm-stack/plugin-node/types";
import { CommandEntryTypeDefinition } from "./reflection";

export interface CLITitleOptions {
  /**
   * The title to display in the banner of the CLI application.
   *
   * @remarks
   * This will be displayed in a large font in the CLI banner. If left undefined, the title will default to the value in {@link Context.options.name}. If set to `false`, the title will not be displayed.
   */
  text?: string;

  /**
   * The font to use for the application title in the banner of the CLI.
   *
   * @remarks
   * Valid options include those allowed by the [cfont](https://www.npmjs.com/package/cfont) package:
   * - `block`       [colors: 2] _(default)_
   *     ![block font style](https://raw.githubusercontent.com/dominikwilkowski/cfonts/released/img/block.png)
   * - `slick`       [colors: 2]
   *     ![slick font style](https://raw.githubusercontent.com/dominikwilkowski/cfonts/released/img/slick.png)
   * - `tiny`        [colors: 1]
   *     ![tiny font style](https://raw.githubusercontent.com/dominikwilkowski/cfonts/released/img/tiny.png)
   * - `grid`        [colors: 2]
   *     ![grid font style](https://raw.githubusercontent.com/dominikwilkowski/cfonts/released/img/grid.png)
   * - `pallet`      [colors: 2]
   *     ![pallet font style](https://raw.githubusercontent.com/dominikwilkowski/cfonts/released/img/pallet.png)
   * - `shade`       [colors: 2]
   *     ![shade font style](https://raw.githubusercontent.com/dominikwilkowski/cfonts/released/img/shade.png)
   * - `chrome`      [colors: 3]
   *     ![chrome font style](https://raw.githubusercontent.com/dominikwilkowski/cfonts/released/img/chrome.png)
   * - `simple`      [colors: 1]
   *     ![simple font style](https://raw.githubusercontent.com/dominikwilkowski/cfonts/released/img/simple.png)
   * - `simpleBlock` [colors: 1]
   *     ![simple-block font style](https://raw.githubusercontent.com/dominikwilkowski/cfonts/released/img/simple-block.png)
   * - `3d`          [colors: 2]
   *     ![3d font style](https://raw.githubusercontent.com/dominikwilkowski/cfonts/released/img/3d.png)
   * - `simple3d`    [colors: 1]
   *     ![simple-3d font style](https://raw.githubusercontent.com/dominikwilkowski/cfonts/released/img/simple-3d.png)
   * - `huge`        [colors: 2]
   *     ![huge font style](https://raw.githubusercontent.com/dominikwilkowski/cfonts/released/img/huge.png)
   *
   * @defaultValue "tiny"
   */
  font?:
    | "block"
    | "slick"
    | "tiny"
    | "grid"
    | "pallet"
    | "shade"
    | "chrome"
    | "simple"
    | "simpleBlock"
    | "3d"
    | "simple3d"
    | "huge";

  /**
   * The alignment of the title in the banner.
   *
   * @defaultValue "center"
   */
  align?: "left" | "center" | "right";

  /**
   * The colors to use for the banner title text.
   *
   * @remarks
   * The below colors are supported as input values:
   * - system - The `system` color falls back to the system color of your terminal.
   * - black
   * - red
   * - green
   * - yellow
   * - blue
   * - magenta
   * - cyan
   * - white
   * - gray
   * - redBright
   * - greenBright
   * - yellowBright
   * - blueBright
   * - magentaBright
   * - cyanBright
   * - whiteBright
   *
   * @defaultValue ["system"]
   */
  colors?: string[];

  /**
   * The background color of the banner title.
   *
   * @defaultValue "transparent"
   */
  background?: string;

  /**
   * The letter spacing of the title text.
   *
   * @remarks
   * This value is in pixels and can be a negative number to reduce the spacing between letters.
   *
   * @defaultValue 1
   */
  letterSpacing?: number;

  /**
   * The line height of the title text.
   *
   * @remarks
   * This value is in pixels and can be a negative number to reduce the spacing between lines.
   *
   * @defaultValue 1.2
   */
  lineHeight?: number;

  /**
   * Set a gradient over the title text.
   *
   * @remarks
   * The gradient requires two colors, a start color and an end color from left to right
   *
   * @defaultValue false
   */
  gradient?: false | string[];

  /**
   * If true, the title will be displayed in independent gradient mode.
   *
   * @remarks
   * This means that each letter will have its own gradient color.
   *
   * @defaultValue false
   */
  independentGradient?: boolean;
}

export interface CFontResultObject {
  string: string;
  width: number;
  height: number;
}

export interface CLIPluginOptions extends NodePluginOptions {
  /**
   * The name of the binary that will be generated to run the CLI
   */
  bin?: string | string[];

  /**
   * The lowest Node.js version that the CLI will support.
   *
   * @defaultValue 20
   */
  minNodeVersion?: 24 | 22 | 20 | 18 | 16;

  /**
   * If a boolean, this will be used to determine the default value of the `interactive` flag. If `never` is specified, the CLI will not include an interactive mode.
   */
  interactive?: boolean | "never";

  /**
   * The title to display in the banner of the CLI application
   *
   * @remarks
   * This will be displayed in a large font in the CLI banner. If left undefined, the title will default to the value in {@link Context.options.name}. If set to `false`, the title will not be displayed.
   */
  title?: CLITitleOptions | string | false;

  /**
   * The author/organization that developed or maintains the CLI application
   *
   * @remarks
   * This can be a string or an object with `name`, `email`, and `url` properties. If this option is not provided, the preset will try to use the \`author.name\` or \`contributors.name\` value from the `\package.json\` file. If not found in the `package.json`, it will try to find it in {@link WorkspaceConfig.organization}.
   */
  author?: WorkspaceConfig["organization"];

  /**
   * The colors to use for the CLI application.
   */
  colors?: SingleThemeColors;

  /**
   * The configuration for the date plugin.
   */
  date?: DatePluginOptions;
}

export interface CLIPluginResolvedOptions extends NodePluginResolvedOptions {
  cli: Required<
    Omit<CLIPluginOptions, "config" | "error" | "logs" | "author">
  > &
    Pick<CLIPluginOptions, "author">;
}

export interface CLICommandReflectionProperties {
  request: Reflection<any>;
  result: Reflection<any>;
}

export interface CLIPluginReflectionRecord extends EnvPluginReflectionRecord {
  requests: ReflectionRecord;
  cli: ReflectionRecord<CLICommandReflectionProperties>;
}

export type CLIPluginContext = Context<
  | StandaloneApplicationResolvedOptions<CLIPluginResolvedOptions>
  | StandaloneLibraryResolvedOptions<CLIPluginResolvedOptions>,
  CLIPluginReflectionRecord,
  CommandEntryTypeDefinition
>;
