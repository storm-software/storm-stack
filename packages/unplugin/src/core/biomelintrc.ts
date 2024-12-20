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

import type { Import } from "unimport";

export function generateBiomeLintConfigs(imports: Import[]) {
  const names = imports
    .map(i => i.as ?? i.name)
    .filter(Boolean)
    .sort();

  const config = { javascript: { globals: names } };
  const jsonBody = JSON.stringify(config, null, 2);

  return jsonBody;
}
