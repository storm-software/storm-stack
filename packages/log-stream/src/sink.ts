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

import type { LogRecord, LogSink } from "@storm-stack/types/log";
import type { WritableStream } from "node:stream/web";
import { defaultTextFormatter } from "./formatter";
import type { StreamSinkOptions } from "./types";

/**
 * A factory that returns a sink that writes to a {@link WritableStream}.
 *
 * Note that the `stream` is of Web Streams API, which is different from
 * Node.js streams.  You can convert a Node.js stream to a Web Streams API
 * stream using [`stream.Writable.toWeb()`] method.
 *
 * [`stream.Writable.toWeb()`]: https://nodejs.org/api/stream.html#streamwritabletowebstreamwritable
 *
 * @example Sink to the standard error in Deno
 * ```typescript
 * const stderrSink = getStreamSink(Deno.stderr.writable);
 * ```
 *
 * @example Sink to the standard error in Node.js
 * ```typescript
 * import stream from "node:stream";
 * const stderrSink = getStreamSink(stream.Writable.toWeb(process.stderr));
 * ```
 *
 * @param stream - The stream to write to.
 * @param options - The options for the sink.
 * @returns A sink that writes to the stream.
 */
export function getSink(
  stream: WritableStream,
  options: StreamSinkOptions = {}
): LogSink & AsyncDisposable {
  const formatter = options.formatter ?? defaultTextFormatter;
  const encoder = options.encoder ?? new TextEncoder();
  const writer = stream.getWriter();
  let lastPromise = Promise.resolve();
  const sink: LogSink & AsyncDisposable = (record: LogRecord) => {
    const bytes = encoder.encode(formatter(record));
    lastPromise = lastPromise
      .then(async () => writer.ready)
      .then(async () => writer.write(bytes));
  };
  sink[Symbol.asyncDispose] = async () => {
    await lastPromise;
    await writer.close();
  };
  return sink;
}
