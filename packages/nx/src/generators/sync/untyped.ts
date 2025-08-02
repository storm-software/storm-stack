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

import { defineUntypedSchema } from "untyped";

export default defineUntypedSchema({
  $schema: {
    id: "StormStackSyncGeneratorSchema",
    title: "Storm Stack Sync Generator",
    description:
      "A type definition for the Storm Stack - Sync generator's options",
    required: []
  },
  outOfSyncMessage: {
    $schema: {
      title: "Out of Sync Message",
      type: "string",
      description:
        "The message to display when the project is out of sync with the legal-message.txt file"
    },
    $default: "The legal-message.txt file needs to be created"
  }
});
