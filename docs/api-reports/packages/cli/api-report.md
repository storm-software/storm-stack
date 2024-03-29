## API Report File for "@storm-stack/cli"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

/// <reference types="node" />

import { Command } from 'commander';
import { ExecOptions } from 'child_process';
import { Fonts } from 'figlet';
import type { Logger } from 'pino';
import type { LoggerOptions } from 'pino';
import { Options } from 'figlet';
import pino from 'pino';
import { Readable } from 'node:stream';
import { StdioOptions } from 'child_process';
import type { StormConfig } from '@storm-software/config';
import { Temporal } from '@js-temporal/polyfill';

// @public (undocumented)
interface CLIArgument {
    // (undocumented)
    default?: unknown | undefined;
    // (undocumented)
    description?: string;
    // (undocumented)
    flags: string;
}
export { CLIArgument }
export { CLIArgument as CLIArgument_alias_1 }

// @public (undocumented)
interface CLICommand {
    // (undocumented)
    action: (...args: any[]) => MaybePromise<void>;
    // (undocumented)
    argument?: CLIArgument[];
    // (undocumented)
    commands?: CLICommand[];
    // (undocumented)
    description: string;
    // (undocumented)
    name: string;
    // (undocumented)
    options?: CLIOption[];
}
export { CLICommand }
export { CLICommand as CLICommand_alias_1 }

// @public (undocumented)
interface CLIConfig {
    // (undocumented)
    banner?: CLITitle;
    // (undocumented)
    by?: CLITitle;
    // (undocumented)
    commands: CLICommand[];
    // (undocumented)
    description: string;
    // (undocumented)
    documentationUrl?: string;
    // (undocumented)
    homepageUrl?: string;
    // (undocumented)
    license?: string;
    // (undocumented)
    licenseUrl?: string;
    // (undocumented)
    name: string;
    // (undocumented)
    postAction: (command: Command) => MaybePromise<void>;
    // (undocumented)
    preAction: (command: Command) => MaybePromise<void>;
    // (undocumented)
    repositoryUrl?: string;
}
export { CLIConfig }
export { CLIConfig as CLIConfig_alias_1 }

// @public (undocumented)
interface CLIOption {
    // (undocumented)
    choices?: string[];
    // (undocumented)
    default?: CLIOptionDefault;
    // (undocumented)
    description: string | undefined;
    // (undocumented)
    flags: string;
}
export { CLIOption }
export { CLIOption as CLIOption_alias_1 }

// @public (undocumented)
interface CLIOptionDefault {
    // (undocumented)
    description?: string | undefined;
    // (undocumented)
    value: unknown;
}
export { CLIOptionDefault }
export { CLIOptionDefault as CLIOptionDefault_alias_1 }

// @public (undocumented)
interface CLITitle {
    // (undocumented)
    font?: Fonts;
    // (undocumented)
    hide?: boolean;
    // (undocumented)
    name?: string;
    // (undocumented)
    options?: Options;
}
export { CLITitle }
export { CLITitle as CLITitle_alias_1 }

// @public
function createCliOptions(obj: Record<string, string | number | boolean>): string[];
export { createCliOptions }
export { createCliOptions as createCliOptions_alias_1 }
export { createCliOptions as createCliOptions_alias_2 }

// @public
function createCliOptionsString(obj: Record<string, string | number | boolean>): string;
export { createCliOptionsString }
export { createCliOptionsString as createCliOptionsString_alias_1 }
export { createCliOptionsString as createCliOptionsString_alias_2 }

// @public (undocumented)
function createCLIProgram(cliConfig: CLIConfig): Promise<void>;
export { createCLIProgram }
export { createCLIProgram as createCLIProgram_alias_1 }

// @public
const execute: (command: string, options?: ExecOptions, env?: Record<string, string>, stdio?: StdioOptions) => string | Buffer | Readable | undefined;
export { execute }
export { execute as execute_alias_1 }
export { execute as execute_alias_2 }

// @public
const executeAsync: (command: string, options?: ExecOptions, env?: Record<string, string>, stdio?: StdioOptions) => Promise<string | Buffer | undefined>;
export { executeAsync }
export { executeAsync as executeAsync_alias_1 }
export { executeAsync as executeAsync_alias_2 }

// @public
const isCI: () => boolean;
export { isCI }
export { isCI as isCI_alias_1 }
export { isCI as isCI_alias_2 }

// @public
const isInteractive: (stream?: NodeJS.ReadStream & {
    fd: 0;
}) => boolean;
export { isInteractive }
export { isInteractive as isInteractive_alias_1 }
export { isInteractive as isInteractive_alias_2 }

// @public
function link(url: string): string;
export { link }
export { link as link_alias_1 }
export { link as link_alias_2 }

// @public (undocumented)
export function registerShutdown(config: {
    logger: StormLog;
    onShutdown(): void | MaybePromise<void>;
}): (reason?: string) => Promise<void>;

// (No @packageDocumentation comment for this package)

```
