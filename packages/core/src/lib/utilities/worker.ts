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

import { LogLevelLabel } from "@storm-software/config-tools/types";
import { findFileName } from "@stryke/path/file-path-fns";
import { defu } from "defu";
import { Worker as JestWorker } from "jest-worker";
import type { ChildProcess } from "node:child_process";
import { Transform } from "node:stream";
import { LogFn } from "../../types/config";
import { WorkerProcess } from "../../types/context";
import { createLog } from "../logger";

export type WorkerOptions = ConstructorParameters<typeof JestWorker>[1] & {
  name?: string;
  timeout?: number;
  onActivity?: () => void;
  onActivityAbort?: () => void;
  onRestart?: (method: string, args: any[], attempts: number) => void;
  exposedMethods: ReadonlyArray<string>;
  enableWorkerThreads?: boolean;
  context?: Record<string, any>;
};

const RESTARTED = Symbol("restarted");

const cleanupWorkers = (worker: JestWorker) => {
  for (const curWorker of ((worker as any)._workerPool?._workers || []) as {
    _child?: ChildProcess;
  }[]) {
    curWorker._child?.kill("SIGINT");
  }
};

export class Worker {
  #worker: JestWorker | undefined;

  #log: LogFn;

  public constructor(
    protected workerPath: string,
    protected options: WorkerOptions
  ) {
    const { timeout, onRestart, name, context, ...farmOptions } = this.options;

    this.#log = createLog(name || workerPath);

    let restartPromise: Promise<typeof RESTARTED>;
    let resolveRestartPromise: (arg: typeof RESTARTED) => void;
    let activeTasks = 0;

    this.#worker = undefined;

    // ensure we end workers if they weren't before exit
    process.on("exit", () => {
      this.close();
    });

    const createWorker = () => {
      this.#worker = new JestWorker(workerPath, {
        ...farmOptions,
        forkOptions: {
          ...farmOptions.forkOptions,
          env: {
            ...((farmOptions.forkOptions?.env ?? {}) as any),
            ...process.env,
            STORM_STACK_LOCAL: process.env.STORM_STACK_LOCAL || "0"
          }
        },
        maxRetries: 0
      });
      restartPromise = new Promise(resolve => {
        resolveRestartPromise = resolve;
      });

      /**
       * Jest Worker has two worker types, ChildProcessWorker (uses child_process) and NodeThreadWorker (uses worker_threads)
       * Storm Stack uses ChildProcessWorker by default, but it can be switched to NodeThreadWorker with an experimental flag
       *
       * We only want to handle ChildProcessWorker's orphan process issue, so we access the private property "_child":
       * https://github.com/facebook/jest/blob/b38d7d345a81d97d1dc3b68b8458b1837fbf19be/packages/jest-worker/src/workers/ChildProcessWorker.ts
       *
       * But this property is not available in NodeThreadWorker, so we need to check if we are using ChildProcessWorker
       */
      if (!farmOptions.enableWorkerThreads) {
        for (const worker of ((this.#worker as any)._workerPool?._workers ||
          []) as {
          _child?: ChildProcess;
        }[]) {
          worker._child?.on("exit", (code, signal) => {
            if ((code || (signal && signal !== "SIGINT")) && this.#worker) {
              this.#log(
                LogLevelLabel.ERROR,
                `${this.options.name} worker exited with code: ${code} and signal: ${signal}`
              );

              // if a child process doesn't exit gracefully, we want to bubble up the exit code to the parent process
              process.exit(code ?? 1);
            }
          });

          // if a child process emits a particular message, we track that as activity
          // so the parent process can keep track of progress
          worker._child?.on("message", ([, data]: [number, unknown]) => {
            if (
              data &&
              typeof data === "object" &&
              "type" in data &&
              data.type === "activity"
            ) {
              // eslint-disable-next-line ts/no-use-before-define
              onActivity();
            }
          });
        }
      }

      let aborted = false;
      const onActivityAbort = () => {
        if (!aborted) {
          this.options.onActivityAbort?.();
          aborted = true;
        }
      };

      // Listen to the worker's stdout and stderr, if there's any thing logged, abort the activity first
      const abortActivityStreamOnLog = new Transform({
        transform(_chunk, _encoding, callback) {
          onActivityAbort();
          callback();
        }
      });
      // Stop the activity if there's any output from the worker
      this.#worker.getStdout().pipe(abortActivityStreamOnLog);
      this.#worker.getStderr().pipe(abortActivityStreamOnLog);

      // Pipe the worker's stdout and stderr to the parent process
      this.#worker.getStdout().pipe(process.stdout);
      this.#worker.getStderr().pipe(process.stderr);
    };
    createWorker();

    const onHanging = () => {
      const worker = this.#worker;
      if (!worker) {
        return;
      }

      const resolve = resolveRestartPromise;
      createWorker();

      this.#log(
        LogLevelLabel.WARN,
        `Sending SIGTERM signal to static worker due to timeout${
          timeout ? ` of ${timeout / 1000} seconds` : ""
        }. Subsequent errors may be a result of the worker exiting.`
      );

      void worker.end().then(() => {
        resolve(RESTARTED);
      });
    };

    let hangingTimer: NodeJS.Timeout | false = false;

    const onActivity = () => {
      if (hangingTimer) {
        clearTimeout(hangingTimer);
      }
      if (this.options.onActivity) {
        this.options.onActivity();
      }

      hangingTimer = activeTasks > 0 && setTimeout(onHanging, timeout);
    };

    for (const method of farmOptions.exposedMethods) {
      if (method.startsWith("_")) {
        continue;
      }

      (this as any)[method] = timeout
        ? async (...args: any[]) => {
            activeTasks++;
            try {
              let attempts = 0;
              for (;;) {
                onActivity();

                const params = defu(
                  args.length > 0 && args[0] ? args[0] : {},
                  context ?? {}
                );

                const result = await Promise.race([
                  // eslint-disable-next-line ts/no-unsafe-call
                  (this.#worker as any)[method](...params),
                  restartPromise
                ]);
                if (result !== RESTARTED) {
                  return result;
                }
                if (onRestart) {
                  onRestart(method, args, ++attempts);
                }
              }
            } finally {
              activeTasks--;
              onActivity();
            }
          }
        : // eslint-disable-next-line ts/no-unsafe-call
          (this.#worker as any)[method].bind(this.#worker);
    }
  }

  public async end(): ReturnType<JestWorker["end"]> {
    const worker = this.#worker;
    if (!worker) {
      throw new Error("Farm is ended, no more calls can be done to it");
    }

    cleanupWorkers(worker);
    this.#worker = undefined;
    return worker.end();
  }

  /**
   * Quietly end the worker if it exists
   */
  public close(): void {
    if (this.#worker) {
      cleanupWorkers(this.#worker);
      void this.#worker.end();
    }
  }
}

export function createWorker<
  TExposedMethods extends ReadonlyArray<string> = ReadonlyArray<string>
>(
  workerPath: string,
  exposedMethods: TExposedMethods,
  numWorkers = 1
): WorkerProcess<TExposedMethods> {
  return new Worker(workerPath, {
    name: findFileName(workerPath, {
      withExtension: false
    }),
    exposedMethods,
    numWorkers
  }) as WorkerProcess<TExposedMethods>;
}
