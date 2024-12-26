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

// Same logic as https://github.com/sindresorhus/is-interactive/blob/dc8037ae1a61d828cfb42761c345404055b1e036/index.js
// But defaults to check `stdin` for our prompts
// It checks that the stream is TTY, not a dumb terminal

/**
 * Check if the current process is interactive
 *
 * @param stream - The stream to check
 * @returns True if the current process is interactive
 */
export const isInteractive = (stream = process.stdin): boolean => {
  return Boolean(stream?.isTTY && process.env.TERM !== "dumb");
};
