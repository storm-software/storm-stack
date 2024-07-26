export interface SelectOption<T = string> {
  /**
   * 	The string value to display in the field
   */
  name: T;

  /**
   * The value stored behind the scenes when selected
   */
  value: string | number | boolean;

  /**
   * Is the option value valid for selection in the dropdown
   */
  disabled: boolean;

  /**
   * Sets or retrieves whether the option in the list box is the default item.
   */
  selected: boolean;
}
