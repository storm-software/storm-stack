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

import { StormLog } from "@storm-stack/logging";
import type { MaybePromise } from "@storm-stack/types";

const errorTypes = ["unhandledRejection", "uncaughtException"];
const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

export function registerShutdown(config: {
  onShutdown(): void | MaybePromise<void>;
}): (reason?: string) => Promise<void> {
  let exited = false;

  async function shutdown() {
    if (exited) {
      return;
    }
    StormLog.info("Shutting down...");
    exited = true;
    await config.onShutdown();
  }

  for (const type of errorTypes) {
    process.on(type, async e => {
      try {
        StormLog.info(`process.on ${type}`);
        StormLog.error(e);
        await shutdown();
        StormLog.info("Shutdown process complete, exiting with code 0");
        process.exit(0);
      } catch (error_) {
        StormLog.warn("Shutdown process failed, exiting with code 1");
        StormLog.error(error_);
        process.exit(1);
      }
    });
  }

  for (const type of signalTraps) {
    process.once(type, async () => {
      try {
        StormLog.info(`process.on ${type}`);
        await shutdown();
        StormLog.info("Shutdown process complete, exiting with code 0");
        process.exit(0);
      } catch (error_) {
        StormLog.warn("Shutdown process failed, exiting with code 1");
        StormLog.error(error_);
        process.exit(1);
      }
    });
  }

  return async (reason?: string) => {
    try {
      StormLog.info(`Manual shutdown ${reason ? `(${reason})` : ""}`);
      await shutdown();
      StormLog.info("Shutdown process complete, exiting with code 0");
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(0);
    } catch (error_) {
      StormLog.warn("Shutdown process failed, exiting with code 1");
      StormLog.error(error_);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  };
}
