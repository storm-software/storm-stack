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
  SourceFile as SourceFileExternal,
  SourceFileProps as SourceFilePropsExternal,
  getContext,
  splitProps
} from "@alloy-js/core";
import { OutputModeType } from "@storm-stack/core/types/vfs";
import { ComponentProps } from "../../types/templates";

export type SourceFileProps = SourceFilePropsExternal &
  ComponentProps & {
    /**
     * If true, indicates that the file is virtual and should not be written to disk.
     *
     * @defaultValue false
     */
    outputMode?: OutputModeType;
  };

/**
 * A base component representing a Storm Stack generated source file.
 *
 * @param props - The properties for the source file.
 * @returns The rendered source file component.
 */
export function SourceFile(props: SourceFileProps) {
  const [{ outputMode }, rest] = splitProps(props, ["outputMode"]);

  const nodeContext = getContext()!;
  nodeContext.meta ??= {};
  nodeContext.meta.output = {
    outputMode
  };

  return <SourceFileExternal {...rest} />;
}
