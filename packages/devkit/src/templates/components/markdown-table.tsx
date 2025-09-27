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

import { code, computed, Prose, Show, splitProps } from "@alloy-js/core";
import { isUndefined } from "@storm-stack/core/deepkit/core";
import { titleCase } from "@stryke/string-format/title-case";
import { ComponentProps } from "../../types/templates";
import {
  MarkdownTableColumnContextInterface,
  MarkdownTableContext,
  useMarkdownTable
} from "../context/markdown-table";

export interface MarkdownTableProps<
  T extends Record<string, any> = Record<string, any>
> extends ComponentProps {
  data: T[];
}

/**
 * Component that provides a context for rendering markdown tables.
 */
export function MarkdownTable<
  T extends Record<string, any> = Record<string, any>
>(props: MarkdownTableProps<T>) {
  const [{ children, data }] = splitProps(props, ["children", "data"]);

  const columns = computed(() =>
    Object.keys(data).map((name: string, index: number) => ({
      index,
      name,
      align: "left" as const,
      width: 20
    }))
  );

  return (
    <MarkdownTableContext.Provider value={{ columns: columns.value, data }}>
      <Show when={Boolean(children)}>{children}</Show>
    </MarkdownTableContext.Provider>
  );
}

export type MarkdownTableColumnProps = ComponentProps &
  Partial<Pick<MarkdownTableColumnContextInterface, "align">> &
  Required<Pick<MarkdownTableColumnContextInterface, "name">> & {
    width?: number;
  };

/**
 * Component that provides a context for rendering markdown tables.
 */
export function MarkdownTableColumn(props: MarkdownTableColumnProps) {
  const [{ children, width, align, name }] = splitProps(props, [
    "children",
    "width",
    "align",
    "name"
  ]);

  const tableContext = useMarkdownTable();
  const columnRef = computed(() =>
    tableContext?.columns.find(c => c.name === name)
  );

  const indexRef = computed(() => columnRef.value?.index ?? 0);
  const alignRef = computed(() => columnRef.value?.align ?? align ?? "left");
  const widthRef = computed(() => columnRef.value?.width ?? width ?? 20);

  const textLength = computed(() => {
    const content = children ? children.toString() : "";

    return content.length;
  });

  return (
    <Prose>
      <Show when={indexRef.value === 0}>{"|"}</Show>
      <Show when={Boolean(children)}>
        <Prose>{code`${
          alignRef.value === "left"
            ? " ".repeat(widthRef.value - textLength.value - 1)
            : " "
        }${children}${
          alignRef.value === "right"
            ? " ".repeat(widthRef.value - textLength.value - 1)
            : " "
        }`}</Prose>
      </Show>
      {"|"}
    </Prose>
  );
}

/**
 * Component that provides a context for rendering markdown tables.
 */
export function MarkdownTableColumnHeader(props: MarkdownTableColumnProps) {
  const [{ children, name }, rest] = splitProps(props, ["children", "name"]);

  return (
    <>
      <MarkdownTableColumn {...rest} name={name}>
        <Show
          fallback={titleCase(name, {
            useDescriptions: false
          })}
          when={!isUndefined(children)}>
          {children}
        </Show>
      </MarkdownTableColumn>
    </>
  );
}
