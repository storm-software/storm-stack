/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { createLog, extendLog } from "../helpers/utilities/logger";
import { writeFile } from "../helpers/utilities/write-file";
import { installPackage } from "../init/installs/utilities";
import type { Context } from "../types/build";
import type { LogFn } from "../types/config";
import { IRenderer } from "../types/plugin";

export type RendererProps<
  TConfig extends Record<string, any> = Record<string, any>
> = TConfig & { log?: LogFn };

/**
 * The base class for all renderers
 */
export abstract class Renderer<
  TConfig extends Record<string, any> = Record<string, any>
> implements IRenderer
{
  #log?: LogFn;

  /**
   * The name of the renderer
   *
   * @remarks
   * This is used to identify the renderer in logs and other output.
   */
  public get name(): string {
    const name = kebabCase(this.constructor.name);
    if (name.startsWith("renderer-")) {
      return name.replace(/^renderer-/, "").trim();
    } else if (name.endsWith("-renderer")) {
      return name.replace(/-renderer$/, "").trim();
    }

    return name;
  }

  /**
   * The logger function to use
   */
  protected get log(): LogFn {
    if (!this.#log) {
      this.#log = createLog(`${this.name}-renderer`);
    }

    return this.#log;
  }

  /**
   * The constructor for the renderer
   *
   * @param config - The configuration options for the renderer
   */
  public constructor(protected config: RendererProps<TConfig>) {
    if (this.config.log) {
      this.#log = extendLog(this.config.log, `${this.name}-renderer`);
    }
  }

  /**
   * Writes a file to the file system
   *
   * @param filepath - The file path to write the file
   * @param content - The content to write to the file
   * @param skipFormat - Should the plugin skip formatting the `content` string with Prettier
   */
  protected async writeFile(
    filepath: string,
    content: string,
    skipFormat = false
  ) {
    this.log(LogLevelLabel.TRACE, `Writing file ${filepath} to disk`);

    return writeFile(this.log, filepath, content, skipFormat);
  }

  /**
   * Installs a package if it is not already installed.
   *
   * @param context - The resolved Storm Stack context
   * @param packageName - The name of the package to install
   * @param dev - Whether to install the package as a dev dependency
   */
  protected async install(context: Context, packageName: string, dev = false) {
    return installPackage(this.log, context, packageName, dev);
  }
}
