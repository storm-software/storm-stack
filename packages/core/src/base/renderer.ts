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
import { extendLog } from "../helpers/utilities/logger";
import { writeFile } from "../helpers/utilities/write-file";
import { installPackage } from "../init/installs/utilities";
import type { Context } from "../types/build";
import type { LogFn } from "../types/config";
import { IRenderer } from "../types/plugin";

/**
 * A base class used by all Storm Stack renderers.
 *
 * @remarks
 * Renderer classes are used by plugins to render generated output files during various Storm Stack processes. Some possible items rendered include (but are not limited to): source code, documentation, DevOps configuration, and deployment infrastructure/IOC.
 */
export abstract class Renderer implements IRenderer {
  /**
   * The name of the renderer
   */
  public name: string;

  /**
   * The logger function to use
   */
  public log: LogFn;

  /**
   * The constructor for the renderer
   *
   * @param log - The logger function to use
   * @param name - The name of the renderer
   */
  public constructor(log: LogFn, name: string) {
    this.name = name.toLowerCase();
    if (this.name.startsWith("renderer-")) {
      this.name = this.name.replace(/^renderer-/, "").trim();
    } else if (this.name.endsWith("-renderer")) {
      this.name = this.name.replace(/-renderer$/, "").trim();
    }

    this.log = extendLog(log, `${this.name}-renderer`);
  }

  /**
   * Writes a file to the file system
   *
   * @param filepath - The file path to write the file
   * @param content - The content to write to the file
   * @param skipFormat - Should the renderer skip formatting the `content` string with Prettier
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
