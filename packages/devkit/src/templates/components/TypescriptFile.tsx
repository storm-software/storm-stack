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
  getContext,
  Scope,
  Show,
  SourceDirectoryContext,
  splitProps,
  useContext,
  useScope
} from "@alloy-js/core";
import {
  getSourceDirectoryData,
  ImportStatements,
  TSModuleScope
} from "@alloy-js/typescript";
import { joinPaths } from "@stryke/path/join-paths";
import { ComponentProps } from "../../types/templates";
import { TypescriptFileContext } from "../context/typescript-file";
import { SourceFile, SourceFileProps } from "./SourceFile";
import { TypescriptFileHeader } from "./TypescriptFileHeader";

export type TypescriptFileProps = Omit<SourceFileProps, "filetype"> &
  ComponentProps & {
    header?: Children;
  };

/**
 * A base component representing a Storm Stack generated Typescript source file.
 *
 * @param props - The properties for the source file.
 * @returns The rendered source file component.
 */
export function TypescriptFile(props: TypescriptFileProps) {
  const [{ outputMode }, rest] = splitProps(props, ["outputMode"]);

  const directoryContext = useContext(SourceDirectoryContext)!;
  const sdData = getSourceDirectoryData(directoryContext);

  const parent = useScope();
  const scope = new TSModuleScope(
    joinPaths(directoryContext.path, props.path),
    parent
  );
  sdData.modules.add(scope);

  const nodeContext = getContext()!;
  nodeContext.meta ??= {};
  nodeContext.meta.output = {
    outputMode
  };

  return (
    <SourceFile
      header={<TypescriptFileHeader />}
      {...rest}
      filetype="typescript">
      <Show when={scope.importedModules.size > 0}>
        <ImportStatements records={scope.importedModules} />
        <hbr />
        <hbr />
      </Show>
      <TypescriptFileContext.Provider
        value={{
          scope
        }}>
        <Scope value={scope}>{rest.children}</Scope>
      </TypescriptFileContext.Provider>
    </SourceFile>
  );
}
