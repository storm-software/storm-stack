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

import { getContext, splitProps } from "@alloy-js/core";
import { TypescriptFile, TypescriptFileProps } from "./TypescriptFile";

export type RuntimeFileProps = Omit<TypescriptFileProps, "path"> & {
  /**
   * The runtime module identifier.
   *
   * @remarks
   * This value will be included after the \`storm:\` prefix in the import statement.
   */
  id: string;

  /**
   * Whether the file is a TSX file.
   *
   * @defaultValue false
   */
  tsx?: boolean;
};

/**
 * A base component representing a Storm Stack generated Typescript source file.
 *
 * @param props - The properties for the source file.
 * @returns The rendered source file component.
 */
export function RuntimeFile(props: RuntimeFileProps) {
  const [{ id, tsx }, rest] = splitProps(props, ["id", "tsx"]);

  const nodeContext = getContext()!;
  nodeContext.meta ??= {};
  nodeContext.meta.runtime = {
    id
  };

  return (
    <TypescriptFile {...rest} path={`${id}${tsx ? ".tsx" : ".ts"}`}>
      {rest.children}
    </TypescriptFile>
  );
}
