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
  Output as OutputExternal,
  shallowReactive,
  splitProps
} from "@alloy-js/core";
import type { Context } from "@storm-stack/core/types/context";
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
  const [{ context, basePath }, rest] = splitProps(props, [
    "context",
    "basePath"
  ]);
  const contextRef = shallowReactive(context);

  return (
    <StormStackContext.Provider value={contextRef}>
      <OutputExternal
        {...rest}
        basePath={basePath || context.options.workspaceRoot}
      />
    </StormStackContext.Provider>
  );
}

export type OutputRuntimeProps = Omit<OutputProps, "basePath">;

/**
 * Output component for rendering the Storm Stack plugin's runtime files via templates.
 */
export function OutputRuntime(props: OutputRuntimeProps) {
  const [{ context }, rest] = splitProps(props, ["context"]);

  return <Output {...rest} context={context} basePath={context.runtimePath} />;
}

/**
 * Output component for rendering the Storm Stack plugin's entry files via templates.
 */
export function OutputEntry(props: OutputRuntimeProps) {
  const [{ context }, rest] = splitProps(props, ["context"]);

  return <Output {...rest} context={context} basePath={context.entryPath} />;
}
