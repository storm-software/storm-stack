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

import { SymbolCreator } from "@alloy-js/core";
import {
  createPackage,
  CreatePackageProps,
  PackageDescriptor,
  PackageRefkeys
} from "@alloy-js/typescript";

export type CreateRuntimeProps<T extends PackageDescriptor> = Omit<
  CreatePackageProps<T>,
  "builtin"
>;

/**
 * Creates a runtime representation of a package based on the provided descriptor.
 *
 * @param props - Properties to define the package, excluding the 'builtin' flag which is set to true.
 * @returns An object containing reference keys for the package and a symbol creator function.
 */
export function createRuntime<const T extends PackageDescriptor>(
  props: CreateRuntimeProps<T>
): PackageRefkeys<T> & SymbolCreator {
  // const refkeys: any = {
  //   [getSymbolCreatorSymbol()](binder: Binder) {
  //     createSymbols(binder, props, refkeys);
  //   }
  // };

  // for (const [path, symbols] of Object.entries(props.descriptor)) {
  //   const keys = path === "." ? refkeys : (refkeys[path] = {});

  //   if (symbols.default) {
  //     keys.default = refkey(props.descriptor, path, "default");
  //   }

  //   for (const named of symbols.named ?? []) {
  //     const namedObj = typeof named === "string" ? { name: named } : named;
  //     keys[namedObj.name] = refkey();

  //     if (namedObj.staticMembers?.length) {
  //       createRefkeysForMembers(
  //         namedObj.staticMembers,
  //         keys[namedObj.name],
  //         "static"
  //       );
  //     }

  //     if (namedObj.instanceMembers?.length) {
  //       createRefkeysForMembers(
  //         namedObj.instanceMembers,
  //         keys[namedObj.name],
  //         "instance"
  //       );
  //     }

  //     keys[namedObj.name][getSymbolCreatorSymbol()] = (
  //       binder: Binder,
  //       parentSym: TSOutputSymbol
  //     ) => {
  //       if (namedObj.staticMembers?.length) {
  //         assignMembers(
  //           binder,
  //           parentSym,
  //           namedObj.staticMembers,
  //           keys[namedObj.name],
  //           true
  //         );
  //       }
  //       if (namedObj.instanceMembers?.length) {
  //         assignMembers(
  //           binder,
  //           parentSym,
  //           namedObj.instanceMembers,
  //           keys[namedObj.name],
  //           false
  //         );
  //       }
  //     };
  //   }
  // }

  // return refkeys;

  return createPackage({ ...props, builtin: true });
}
