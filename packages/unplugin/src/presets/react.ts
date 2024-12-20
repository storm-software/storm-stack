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

import type { ImportsMap } from "../types";

export const CommonReactAPI = [
  "useState",
  "useCallback",
  "useMemo",
  "useEffect",
  "useRef",
  "useContext",
  "useReducer",
  "useImperativeHandle",
  "useDebugValue",
  "useDeferredValue",
  "useLayoutEffect",
  "useTransition",
  "startTransition",
  "useSyncExternalStore",
  "useInsertionEffect",
  "useId",
  "lazy",
  "memo",
  "createRef",
  "forwardRef"
];

export default <ImportsMap>{
  react: CommonReactAPI
};
