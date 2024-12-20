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

import { toArray } from "@antfu/utils";
import type { Addon, Import } from "unimport";
import type {
  ImportExtended,
  ImportLegacy,
  Resolver,
  ResolverResult
} from "../types";

export function normalizeImport(
  info: Import | ResolverResult | ImportExtended | ImportLegacy | string,
  name: string
): ImportExtended {
  if (typeof info === "string") {
    return {
      name: "default",
      as: name,
      from: info
    };
  }
  if ("path" in info) {
    return {
      from: info.path,
      as: info.name,
      name: info.importName!,
      sideEffects: info.sideEffects
    };
  }
  return {
    name,
    as: name,
    ...info
  };
}

export async function firstMatchedResolver(
  resolvers: Resolver[],
  fullName: string
) {
  let name = fullName;
  for (const resolver of resolvers) {
    if (typeof resolver === "object" && resolver.type === "directive") {
      if (name.startsWith("v")) name = name.slice(1);
      // eslint-disable-next-line no-continue
      else continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const resolved = await (typeof resolver === "function"
      ? resolver(name)
      : resolver.resolve(name));
    if (resolved) return normalizeImport(resolved, fullName);
  }
}

export function resolversAddon(resolvers: Resolver[]): Addon {
  return {
    name: "unplugin-storm:resolvers",
    async matchImports(names, matched) {
      if (resolvers.length === 0) return;
      const dynamic: ImportExtended[] = [];
      const sideEffects: ImportExtended[] = [];
      await Promise.all(
        [...names].map(async name => {
          const matchedImport = matched.find(i => i.as === name);
          if (matchedImport) {
            if ("sideEffects" in matchedImport) {
              sideEffects.push(
                ...toArray((matchedImport as ImportExtended).sideEffects).map(
                  i => normalizeImport(i, "")
                )
              );
            }

            return;
          }
          const resolved = await firstMatchedResolver(resolvers, name);
          if (resolved) dynamic.push(resolved);

          if (resolved?.sideEffects) {
            sideEffects.push(
              ...toArray(resolved?.sideEffects).map(i => normalizeImport(i, ""))
            );
          }
        })
      );

      if (dynamic.length > 0) {
        this.dynamicImports.push(...dynamic);
        this.invalidate();
      }

      if (dynamic.length > 0 || sideEffects.length > 0) {
        return [...matched, ...dynamic, ...sideEffects];
      }
    }
  };
}
