/*-------------------------------------------------------------------

      ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website: https://stormsoftware.com
 Repository: https://github.com/storm-software/storm-stack
 Documentation: https://docs.stormsoftware.com/projects/storm-stack
 Contact: https://stormsoftware.com/contact
 Licensing: https://stormsoftware.com/licensing

 -------------------------------------------------------------------*/

/**
 * An error class representing an aborted operation.
 * @augments Error
 */
export class AbortError extends Error {
  constructor(message = "The operation was aborted") {
    super(message);
    this.name = "AbortError";
  }
}

/**
 * An error class representing an timeout operation.
 * @augments Error
 */
export class TimeoutError extends Error {
  constructor(message = "The operation was timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}
