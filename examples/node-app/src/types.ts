/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

// eslint-disable-next-line ts/consistent-type-imports
import { StormSentryLogEnv } from "@storm-stack/log-sentry/types";

export interface ExamplePayload {
  /**
   * The name of the person.
   */
  name: string;

  /**
   * The age of the person.
   */
  age: number;

  /**
   * The address of the person.
   */
  address: {
    /**
     * The street of the address.
     */
    street: string;

    /**
     * The city of the address.
     */
    city: string;

    /**
     * The country of the address.
     */
    country: string;
  };
}

export interface StormNodeAppEnv extends StormSentryLogEnv {}
