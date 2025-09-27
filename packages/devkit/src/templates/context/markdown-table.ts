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

import type { ComponentContext } from "@alloy-js/core";
import { createContext, createNamedContext, useContext } from "@alloy-js/core";

export interface MarkdownTableColumnContextInterface<
  T extends Record<string, any> = Record<string, any>
> {
  index: number;
  name: keyof T;
  align: "left" | "right" | "center";
  width: number;
}

/**
 * The Storm Stack context used in template rendering.
 */
export const MarkdownTableColumnContext: ComponentContext<MarkdownTableColumnContextInterface> =
  createNamedContext<MarkdownTableColumnContextInterface>(
    "markdown-table-column",
    {} as MarkdownTableColumnContextInterface
  );

/**
 * Hook to access the Storm Stack Context.
 *
 * @returns The Context.
 */
export function useMarkdownTableColumn() {
  return useContext<MarkdownTableColumnContextInterface>(
    MarkdownTableColumnContext
  );
}

export interface MarkdownTableContextInterface<
  T extends Record<string, any> = Record<string, any>
> {
  columns: MarkdownTableColumnContextInterface<T>[];
  data: T[];
}

/**
 * The Storm Stack context used in template rendering.
 */
export const MarkdownTableContext: ComponentContext<MarkdownTableContextInterface> =
  createContext<MarkdownTableContextInterface>({
    columns: [],
    data: []
  } as MarkdownTableContextInterface);

/**
 * Hook to access the Storm Stack Context.
 *
 * @returns The Context.
 */
export function useMarkdownTable() {
  return useContext<MarkdownTableContextInterface>(MarkdownTableContext);
}
