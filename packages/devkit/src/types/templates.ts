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

import {
  ContentOutputFile as ExternalContentOutputFile,
  CopyOutputFile as ExternalCopyOutputFile,
  OutputDirectory as ExternalOutputDirectory,
  OutputFileBase as ExternalOutputFileBase,
  PrintTreeOptions
} from "@alloy-js/core";
import { Children } from "@alloy-js/core/jsx-runtime";
import { SourceFileContext } from "@alloy-js/typescript";
import { OutputModeType } from "@storm-stack/core/types/vfs";

export type RenderOptions = PrintTreeOptions & {
  mode?: "runtime" | "entry" | string;
};

export interface OutputFileBase extends ExternalOutputFileBase {
  /**
   * The format of the output files
   *
   * @remarks
   * If not specified, the output mode will be determined by the provided \`output.outputMode\` value.
   */
  outputMode?: OutputModeType;
}

export interface CopyOutputFile
  extends ExternalCopyOutputFile,
    OutputFileBase {}

export interface ContentOutputFile
  extends ExternalContentOutputFile,
    OutputFileBase {
  contents: string;
  filetype: string;
}

export type OutputFile = ContentOutputFile | CopyOutputFile;

export interface OutputDirectory extends ExternalOutputDirectory {
  contents: (OutputDirectory | OutputFile)[];
}

export interface RuntimeOutputFile extends ContentOutputFile {
  id: string;
}

export interface RuntimeOutputDirectory extends OutputDirectory {
  contents: (RuntimeOutputDirectory | RuntimeOutputFile)[];
}

export interface RenderOutput<
  TRenderOptions extends RenderOptions = RenderOptions
> {
  /**
   * The rendered runtime modules.
   *
   * @remarks
   * The modules rendered in the `runtime` directory are intended to be built-in modules that can be imported by user code from `"storm:<id>"`.
   */
  runtime: RuntimeOutputDirectory;

  /**
   * The rendered entry modules.
   *
   * @remarks
   * The modules rendered in the `entry` directory are intended to be the main entry points for the application, such as `index.ts` or `main.ts`.
   */
  entry: TRenderOptions["mode"] extends "runtime" ? null : OutputDirectory;

  /**
   * The rendered output files.
   *
   * @remarks
   * The output files include any additional files that are not part of the runtime or entry modules, such as configuration files, assets, or documentation. These files will have their paths resolved by the workspace root.
   */
  output: TRenderOptions["mode"] extends "runtime"
    ? null
    : TRenderOptions["mode"] extends "entry"
      ? null
      : OutputDirectory;
}

/**
 * A type that represents the props of a component that can have children.
 */
export interface ComponentProps {
  children?: Children;
}

/**
 * A type that requires the `children` prop in a component.
 */
export type ComponentPropsWithChildren = Omit<ComponentProps, "children"> &
  Required<Pick<ComponentProps, "children">>;

export interface RuntimeSourceFileContext extends SourceFileContext {
  /**
   * The runtime module identifier.
   */
  id: string;
}
