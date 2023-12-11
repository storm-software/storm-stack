import { MaybePromise } from "@storm-stack/utilities";
import { Command } from "commander";

export interface CLIConfig {
  name: string;
  description: string;
  commands: CLICommand[];
  preAction: (command: Command) => MaybePromise<void>;
  postAction: (command: Command) => MaybePromise<void>;
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
