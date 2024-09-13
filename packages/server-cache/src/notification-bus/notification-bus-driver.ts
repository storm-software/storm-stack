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

import type { BusOptions, CreateBusDriverResult } from "bentocache/types";
import { NotificationBus } from "./notification-bus";

/**
 * Create a new notification bus driver
 */
export function notificationBusDriver(
  options: BusOptions = {}
): CreateBusDriverResult {
  return {
    options,
    factory: (_: any) => new NotificationBus()
  };
}
