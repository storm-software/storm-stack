/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 ------------------------------------------------------------------- */

import { loadConfig as loadConfigC12 } from "c12";
import defu from "defu";
import type { JitiOptions } from "jiti";
import type { ProjectConfig } from "../types/config";

export async function loadConfig(
  projectRoot: string,
  mode?: string,
  cacheDir?: string
): Promise<ProjectConfig> {
  let jitiOptions: JitiOptions | undefined;
  if (cacheDir) {
    jitiOptions = {
      fsCache: cacheDir,
      moduleCache: true
    };
  }

  const result = await Promise.all([
    loadConfigC12({
      cwd: projectRoot,
      name: "storm",
      envName: mode,
      globalRc: true,
      packageJson: true,
      dotenv: true,
      jitiOptions
    }),
    loadConfigC12({
      cwd: projectRoot,
      name: "storm",
      configFile: "storm",
      rcFile: false,
      globalRc: false,
      packageJson: false,
      dotenv: false,
      jitiOptions
    }),
    loadConfigC12({
      cwd: projectRoot,
      name: "storm-stack",
      envName: mode,
      globalRc: true,
      packageJson: ["storm-stack", "stormStack"],
      dotenv: true,
      jitiOptions
    }),
    loadConfigC12({
      cwd: projectRoot,
      name: "storm-stack",
      configFile: "storm-stack",
      rcFile: false,
      globalRc: false,
      packageJson: false,
      dotenv: false,
      jitiOptions
    })
  ]);

  return defu(
    result[0].config,
    result[1].config,
    result[2].config,
    result[3].config
  ) as ProjectConfig;
}
