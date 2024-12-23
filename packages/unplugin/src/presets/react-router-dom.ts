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
import { ReactRouterHooks } from "./react-router";

/**
 * Only compatible with React Router Dom v6.
 */
export default <ImportsMap>{
  "react-router-dom": [
    ...ReactRouterHooks,

    // react-router-dom only hooks
    "useLinkClickHandler",
    "useSearchParams",

    // react-router-dom Component

    // call once in general
    // 'BrowserRouter',
    // 'HashRouter',
    // 'MemoryRouter',

    "Link",
    "NavLink",
    "Navigate",
    "Outlet",
    "Route",
    "Routes"
  ]
};
