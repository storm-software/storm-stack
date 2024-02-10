import type { BusOptions, CreateBusDriverResult } from "bentocache/types";
import { NotificationBus } from "./notification-bus";

/**
 * Create a new notification bus driver
 */
export function notificationBusDriver(options: BusOptions = {}): CreateBusDriverResult {
  return {
    options,
    factory: (_: any) => new NotificationBus()
  };
}
