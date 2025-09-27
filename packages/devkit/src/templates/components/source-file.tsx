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
  getContext,
  Show,
  SourceDirectoryContext,
  SourceFileContext,
  SourceFileProps as SourceFilePropsExternal,
  splitProps,
  useContext,
  useFormatOptions
} from "@alloy-js/core";
import { OutputModeType } from "@storm-stack/core/types/vfs";
import { appendPath } from "@stryke/path/append";
import defu from "defu";
import { ComponentProps } from "../../types/templates";

export type SourceFileProps = SourceFilePropsExternal &
  ComponentProps & {
    /**
     * If true, indicates that the file is virtual and should not be written to disk.
     *
     * @defaultValue false
     */
    outputMode?: OutputModeType;

    /**
     * The metadata associated with the source file.
     *
     * @remarks
     * The values stored in the metadata will be available in the rendering context.
     */
    meta?: Record<string, any>;
  };

/**
 * A base component representing a Storm Stack generated source file.
 *
 * @param props - The properties for the source file.
 * @returns The rendered source file component.
 */
export function SourceFile(props: SourceFileProps) {
  const [{ children, meta, path, header, outputMode, filetype, reference }] =
    splitProps(props, [
      "children",
      "meta",
      "path",
      "header",
      "outputMode",
      "filetype",
      "reference"
    ]);

  const parentDirectory = useContext(SourceDirectoryContext)!;

  const context: SourceFileContext = {
    path: appendPath(path, parentDirectory.path),
    filetype,
    reference
  };
  parentDirectory?.addContent(context);

  const printOptions = useFormatOptions({
    printWidth: props.printWidth,
    tabWidth: props.tabWidth,
    useTabs: props.useTabs,
    insertFinalNewLine: props.insertFinalNewLine
  });

  const nodeContext = getContext()!;
  nodeContext.meta = defu(
    {
      sourceFile: context,
      printOptions,
      output: {
        outputMode
      }
    },
    meta ?? {}
  );

  return (
    <SourceFileContext.Provider value={context}>
      <Show when={header !== undefined}>
        {header}
        <hbr />
      </Show>
      {children}
    </SourceFileContext.Provider>
  );
}
