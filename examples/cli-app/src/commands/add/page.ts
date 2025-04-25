/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

// eslint-disable-next-line ts/consistent-type-imports
import { AddPagePayload } from "../../types";
import addHandler from "./index";

/**
 * Add a page to the file system
 *
 * @param event - The event object containing the payload
 */
function handler(event: StormRequest<AddPagePayload>) {
  addHandler({
    ...event,
    data: {
      ...event.data,
      type: "page"
    }
  });
}

export default handler;
