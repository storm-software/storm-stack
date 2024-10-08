/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

import { isRuntimeServer } from "@storm-stack/utilities/helper-fns/is-runtime-server";
import { useEffect, useLayoutEffect } from "react";

/**
 * The function checks if the code is running on the server-side
 *
 * @returns An indicator specifying if the code is running on the server-side
 */
export const useIsomorphicLayoutEffect = isRuntimeServer()
  ? useEffect
  : useLayoutEffect;
