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
