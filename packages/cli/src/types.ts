/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import { MaybePromise } from "@storm-stack/types";
import { Command } from "commander";
import { Fonts, Options } from "figlet";

export interface CLIConfig {
  name: string;
  banner?: CLITitle;
  by?: CLITitle;
  description: string;
  homepageUrl?: string;
  documentationUrl?: string;
  repositoryUrl?: string;
  license?: string;
  licenseUrl?: string;
  commands: CLICommand[];
  preAction: (command: Command) => MaybePromise<void>;
  postAction: (command: Command) => MaybePromise<void>;
}

export interface CLITitle {
  name?: string;
  font?: Fonts;
  options?: Options;
  hide?: boolean;
}

export interface CLICommand {
  name: string;
  description: string;
  commands?: CLICommand[];
  options?: CLIOption[];
  argument?: CLIArgument[];
  action: (...args: any[]) => MaybePromise<void>;
}

export interface CLIArgument {
  flags: string;
  description?: string;
  default?: unknown | undefined;
}

export interface CLIOption {
  flags: string;
  description: string | undefined;
  choices?: string[];
  default?: CLIOptionDefault;
}

export interface CLIOptionDefault {
  value: unknown;
  description?: string | undefined;
}
