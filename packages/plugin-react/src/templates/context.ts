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

import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import { ReactPluginContext } from "../types/plugin";

export function ContextModule(_context: ReactPluginContext) {
  return `
/**
 * This module provides the Storm Stack context and a hook to access it in the application.
 *
 * @module storm:context
 */

${getFileHeader()}

import { StormContextInterface } from "@storm-stack/types/shared/context";
import { StormConfig, config } from "storm:config";
import * as env from "storm:env";
import { createStorage } from "storm:storage";
import { StormLog } from "storm:log";
import { createContext, useContext, PropsWithChildren } from "react";

/**
 * The global Storm context for the current application.
 *
 * @remarks
 * This interface extends the base Storm context interface with additional properties specific to the React application.
 */
export interface StormContext extends StormContextInterface {
  /**
   * The configuration parameters for the Storm application.
   */
  config: StormConfig;
}

const log = new StormLog();
const initialValues: StormContext = {
  meta: {},
  env,
  config,
  log: log.with({
      name: env.name,
      version: env.version
    }),
  storage: createStorage()
};

const StormContextStore = createContext<StormContext>(initialValues);

/**
 * The Storm context provider component, which wraps the application and provides the Storm context to its children.
 *
 * @param props - The component props.
 * @returns The Storm context provider component.
 */
export function StormContextProvider(props: PropsWithChildren<{}>) {
  const { children } = props;

  return (
    <StormContextStore.Provider value={initialValues}>
      {children}
    </StormContextStore.Provider>
  );
}

/**
 * Get the Storm context for the current application.
 *
 * @returns The Storm context for the current application.
 * @throws If the Storm context is not available.
 */
export function useStorm(): StormContext {
  return useContext(StormContextStore);
}

`;
}
