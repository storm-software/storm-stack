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

/**
 * A utility type for specifying the type of an option for a Select or Radio form field.
 */
export interface SelectOption<T = string> {
  /**
   * The index of the select option
   */
  index: number;

  /**
   * The string value to display in the field
   */
  name: T;

  /**
   * The value stored behind the scenes when selected
   */
  value: string | number | boolean;

  /**
   * The description of the select option
   */
  description?: string;

  /**
   * A short string describing the status of the select option
   */
  status?: string;

  /**
   * Is the option value valid for selection in the dropdown
   */
  disabled: boolean;

  /**
   * Sets or retrieves whether the option in the list box is the default item.
   */
  selected: boolean;
}
