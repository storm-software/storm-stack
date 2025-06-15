// /* -------------------------------------------------------------------

//                   ⚡ Storm Software - Storm Stack

//  This code was released as part of the Storm Stack project. Storm Stack
//  is maintained by Storm Software under the Apache-2.0 license, and is
//  free for commercial and private use. For more information, please visit
//  our licensing page at https://stormsoftware.com/license.

//  Website:                  https://stormsoftware.com
//  Repository:               https://github.com/storm-software/storm-stack
//  Documentation:            https://docs.stormsoftware.com/projects/storm-stack
//  Contact:                  https://stormsoftware.com/contact

//  SPDX-License-Identifier:  Apache-2.0

//  ------------------------------------------------------------------- */

// import { ReflectionClass } from "@deepkit/type";
// import { Context, Options } from "@storm-stack/core/types/build";
// import * as capnp from "@stryke/capnp";
// import { CommandTree } from "../../schemas/cli";

// export async function writeCommandTree<TOptions extends Options = Options>(
//   context: Context<TOptions>,
//   reflection: ReflectionClass<any>,
//   name: "config" | "secrets" = "config"
// ) {
//   const serialized = reflection.serializeType();

//   const message = new capnp.Message();
//   const root = message.initRoot(CommandTree);

//   convertToCapnp(serialized, root);

//   await writeBufferFile(
//     getDotenvReflectionsPath(context, name),
//     message.toArrayBuffer()
//   );
// }

// export async function readCommandTree<TOptions extends Options = Options>(
//   context: Context<TOptions>
// ): Promise<ReflectionClass<any>> {
//   const buffer = await readBufferFile(
//     getDotenvReflectionsPath(context, "config")
//   );
//   const message = new capnp.Message(buffer, false);

//   return resolveClassType(
//     deserializeType(convertFromCapnp(message.getRoot(SerializedTypes).types))
//   );
// }
/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */
/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */
/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */
/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */
/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */
