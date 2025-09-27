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

import type { OutputProps as OutputPropsExternal } from "@alloy-js/core";
import {
  computed,
  Output as OutputExternal,
  ref,
  Show,
  splitProps
} from "@alloy-js/core";
import type { Context } from "@storm-stack/core/types/context";
import { replacePath } from "@stryke/path/replace";
import { StormStackContext } from "../context/context";

export interface OutputProps extends OutputPropsExternal {
  /**
   * The current Storm Stack process context.
   */
  context: Context;
}

/**
 * Output component for rendering the Storm Stack plugin's output files via templates.
 */
export function Output(props: OutputProps) {
  const [{ children, context, basePath }, rest] = splitProps(props, [
    "children",
    "context",
    "basePath"
  ]);

  const contextRef = ref(context);

  // const reactiveContext = reactive(context);
  const basePathRef = computed(() =>
    basePath
      ? replacePath(basePath, contextRef.value.options.workspaceRoot)
      : contextRef.value.options.workspaceRoot
  );

  return (
    <OutputExternal {...rest} basePath={basePathRef.value}>
      <StormStackContext.Provider value={{ ref: contextRef }}>
        <Show when={Boolean(context)}>{children}</Show>
      </StormStackContext.Provider>
    </OutputExternal>
  );
}
