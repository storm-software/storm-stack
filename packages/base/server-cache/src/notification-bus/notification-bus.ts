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

import type { StormTrace } from "@storm-stack/telemetry";
import type { BusDriver, CacheBusMessage } from "bentocache/types";

/**
 * A simple in-memory bus driver for sending data update notifications to subscribers
 */
export class NotificationBus implements BusDriver {
  /**
   * A Map that stores the subscriptions for each channel.
   *
   * key is the channel name and the value is an array of objects
   * containing the handler function and the busId of the subscriber
   */
  static #subscriptions: Map<
    string,
    Array<{
      handler: (message: CacheBusMessage) => void;
      busId: string;
    }>
  > = new Map();

  /**
   * List of messages received by this bus
   */
  receivedMessages: CacheBusMessage[] = [];

  #id!: string;

  #trace?: StormTrace;

  setId(id: string) {
    this.#id = id;
    return this;
  }

  setLogger(logger: StormTrace) {
    this.#trace = logger;
    return this;
  }

  /**
   * Subscribes to the given channel
   */
  async subscribe(
    channelName: string,
    handler: (message: CacheBusMessage) => void
  ) {
    this.#trace?.trace(
      `Subscribing to the notification bus channel: ${channelName}`
    );

    const handlers = NotificationBus.#subscriptions.get(channelName) || [];
    handlers.push({
      handler: message => {
        this.receivedMessages.push(message);
        handler(message);
      },
      busId: this.#id
    });
    NotificationBus.#subscriptions.set(channelName, handlers);
  }

  /**
   * Unsubscribes from the given channel
   */
  async unsubscribe(channelName: string) {
    this.#trace?.trace(
      `Unsubscribing to the notification bus channel: ${channelName}`
    );

    const handlers = NotificationBus.#subscriptions.get(channelName) || [];
    NotificationBus.#subscriptions.set(
      channelName,
      handlers.filter(handlerInfo => handlerInfo.busId !== this.#id)
    );
  }

  /**
   * Publishes a message to the given channel
   */
  publish(
    channelName: string,
    message: Omit<CacheBusMessage, "busId">
  ): Promise<void> {
    this.#trace?.trace(
      `Publishing changes to the notification bus channel: ${channelName}`
    );

    const handlers = NotificationBus.#subscriptions.get(channelName);
    if (!handlers) {
      return Promise.resolve();
    }

    const fullMessage: CacheBusMessage = { ...message, busId: this.#id };
    for (const { handler, busId } of handlers) {
      if (busId === this.#id) {
        continue;
      }

      handler(fullMessage);
    }

    return Promise.resolve();
  }

  /**
   * Disconnects the bus and clears all subscriptions
   */
  disconnect() {
    return Promise.resolve(NotificationBus.#subscriptions.clear());
  }

  async onReconnect(_callback: () => void) {}
}
