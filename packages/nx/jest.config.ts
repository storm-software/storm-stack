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
 Licensing:       https://stormsoftware.com/projects/storm-stack/licensing

 -------------------------------------------------------------------*/

import { getJestConfig } from "@storm-software/testing-tools";

export default getJestConfig("packages/nx", true, "nx");
