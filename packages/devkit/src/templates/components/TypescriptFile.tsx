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

import type { Children } from "@alloy-js/core";
import {
  ComponentContext,
  createNamedContext,
  useContext
} from "@alloy-js/core";
import {
  SourceFile as BaseSourceFile,
  SourceFileContext as BaseSourceFileContext,
  SourceFileProps as BaseSourceFileProps
} from "@alloy-js/typescript";
import { ComponentProps } from "../../types/templates";
import { TypescriptFileHeader } from "./TypescriptFileHeader";

export const SourceFileContext: ComponentContext<BaseSourceFileContext> =
  createNamedContext("@storm-stack/devkit SourceFile");

export function useSourceFile() {
  return useContext(SourceFileContext)!;
}

export interface SourceFileProps extends BaseSourceFileProps, ComponentProps {
  header?: Children;
}

/**
 * A base component representing a Storm Stack generated Typescript source file.
 *
 * @param props - The properties for the source file.
 * @returns The rendered source file component.
 */
export function TypescriptFile(props: SourceFileProps) {
  const { header, children } = props;

  return (
    <BaseSourceFile {...props} header={header || <TypescriptFileHeader />}>
      {children}
    </BaseSourceFile>
  );
}
