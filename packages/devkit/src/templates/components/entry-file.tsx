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

import { computed, splitProps } from "@alloy-js/core";
import { ResolvedEntryTypeDefinition } from "@storm-stack/core/types/build";
import { joinPaths } from "@stryke/path/join-paths";
import defu from "defu";
import { useStorm } from "../context";
import { TypescriptFile, TypescriptFileProps } from "./typescript-file";

export type EntryFileProps = TypescriptFileProps & {
  /**
   * Whether the file is a TSX file.
   *
   * @defaultValue false
   */
  tsx?: boolean;

  /**
   * Render metadata information about the entrypoint
   */
  typeDefinition?: ResolvedEntryTypeDefinition;
};

/**
 * A base component representing a Storm Stack generated Typescript source file.
 *
 * @param props - The properties for the source file.
 * @returns The rendered source file component.
 */
export function EntryFile(props: EntryFileProps) {
  const [{ children, meta, tsx, path, typeDefinition }, rest] = splitProps(
    props,
    ["children", "meta", "tsx", "path", "typeDefinition"]
  );

  const context = useStorm();
  const fullPath = computed(() =>
    joinPaths(
      context?.value?.entryPath || "./",
      `${path}${tsx ? ".tsx" : ".ts"}`
    )
  );

  return (
    <TypescriptFile
      {...rest}
      path={fullPath.value}
      meta={defu(meta ?? {}, {
        entry: {
          typeDefinition
        }
      })}>
      {children}
    </TypescriptFile>
  );
}
