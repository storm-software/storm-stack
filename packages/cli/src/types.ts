import { MaybePromise } from "@storm-stack/utilities";
import { Command } from "commander";

export type CLIConfig = {
  name: string;
  description: string;
  commands: CLICommand[];
  preAction: (command: Command) => MaybePromise<void>;
  postAction: (command: Command) => MaybePromise<void>;
};

export type CLICommand = {
  name: string;
  description: string;
  commands?: CLICommand[];
  options?: CLIOption[];
  argument?: CLIArgument[];
  action: (...args: any[]) => MaybePromise<void>;
};

export type CLIArgument = {
  flags: string;
  description?: string;
  default?: unknown | undefined;
};

export type CLIOption = {
  flags: string;
  description: string | undefined;
  choices?: string[];
  default?: CLIOptionDefault;
};

export type CLIOptionDefault = {
  value: unknown;
  description?: string | undefined;
};
