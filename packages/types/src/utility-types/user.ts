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

export type UserType = "internal" | "external" | "service";

export const UserType = {
  INTERNAL: "internal" as UserType,
  EXTERNAL: "external" as UserType,
  SERVICE: "service" as UserType
};

export interface UserBase {
  /**
   * The user's ID.
   */
  id: string;

  /**
   * The user's full name.
   */
  username?: string;

  /**
   * The user's type.
   *
   * @defaultValue "external"
   */
  type: UserType;

  /**
   * The user's email address.
   */
  email?: string;

  /**
   * The user's role.
   */
  role?: string;
}
