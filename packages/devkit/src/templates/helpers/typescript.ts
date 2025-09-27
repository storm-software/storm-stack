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

import { isUndefined } from "@storm-stack/core/deepkit/core";
import { ReflectionClass } from "@storm-stack/core/deepkit/type";
import { stringifyValue } from "@storm-stack/core/lib/deepkit/utilities";
import { camelCase } from "@stryke/string-format/camel-case";
import { titleCase } from "@stryke/string-format/title-case";

export interface GenerateTypeScriptInterfaceOptions<T> {
  overrideName?: string;
  overrideExtends?: string | false;
  defaultValues?: Partial<T>;
}

// /**
//  * Generates a TypeScript interface for the given reflection class.
//  *
//  * @param reflection - The reflection class to generate the interface for.
//  * @returns A string containing the TypeScript interface definition.
//  */
// export function TypeScriptInterface<T>(
//   reflection: ReflectionClass<T>,
//   options: GenerateTypeScriptInterfaceOptions<T> = {}
// ): string {
//   if (!reflection) {
//     return "";
//   }

//   return `
// /**
//  * Interface for ${reflection.getTitle() || titleCase(options.overrideName || reflection.getName())}.
//  *
//  * @title ${reflection.getTitle() || titleCase(reflection.getName())}${
//    reflection.getAlias().length
//      ? `  ${reflection
//          .getAlias()
//          .map(alias => ` * @alias ${alias}`)
//          .join("\n")}`
//      : ""
//  }${reflection.getDomain() ? ` * @domain ${reflection.getDomain()}` : ""}${
//    reflection.getPermission().length
//      ? `
//   ${reflection
//     .getPermission()
//     .map(permission => ` * @permission ${permission}`)
//     .join("\n")}`
//      : ""
//  }${
//    reflection.isInternal()
//      ? `
//   * @internal`
//      : ""
//  }${
//    reflection.isReadonly()
//      ? `
//   * @readonly`
//      : ""
//  }${
//    reflection.isIgnored()
//      ? `
//   * @ignored`
//      : ""
//  }${
//    reflection.isHidden()
//      ? `
//   * @hidden`
//      : ""
//  }
//  */
// export interface ${pascalCase(options.overrideName || reflection.getName())}${
//     options.overrideExtends !== false &&
//     (options.overrideExtends || reflection.getSuperReflectionClass()?.getName())
//       ? ` extends ${options.overrideExtends || reflection.getSuperReflectionClass()?.getName()}`
//       : ""
//   } {
//   ${reflection
//     .getProperties()
//     .filter(item => !item.isIgnored())
//     .sort((a, b) =>
//       (a.isReadonly() && b.isReadonly()) || (!a.isReadonly() && !b.isReadonly())
//         ? a.getNameAsString().localeCompare(b.getNameAsString())
//         : a.isReadonly()
//           ? 1
//           : -1
//     )
//     .map(
//       item =>
//         `  /**
//   * ${
//     item.getDescription() ||
//     item.getTitle() ||
//     titleCase(item.getNameAsString())
//   }
//   *
//   * @title ${item.getTitle() || titleCase(item.getNameAsString())}${
//     item.getAlias().length
//       ? `
// ${item
//   .getAlias()
//   .map(alias => `  * @alias ${alias}`)
//   .join("\n")}`
//       : ""
//   }${
//     item.getDomain()
//       ? `
//   * @domain ${item.getDomain()}`
//       : ""
//   }${
//     item.getPermission().length
//       ? `
// ${item
//   .getPermission()
//   .map(permission => `  * @permission ${permission}`)
//   .join("\n")}`
//       : ""
//   }${
//     !isUndefined(item.getDefaultValue()) && item.getDefaultValue() !== ""
//       ? `
//   * @defaultValue ${item.getDefaultValue()}`
//       : ""
//   }${
//     item.isInternal()
//       ? `
//   * @internal`
//       : ""
//   }${
//     item.isReadonly()
//       ? `
//   * @readonly`
//       : ""
//   }${
//     item.isHidden()
//       ? `
//   * @hidden`
//       : ""
//   }
//   */
//     ${item.isReadonly() ? "readonly " : ""}${item.getNameAsString()}${
//       isUndefined(
//         (options.defaultValues as Record<string, any>)?.[item.getNameAsString()]
//       ) &&
//       isUndefined(item.getDefaultValue()) &&
//       !item
//         .getAlias()
//         .some(
//           alias =>
//             !isUndefined(
//               (options.defaultValues as Record<string, any>)?.[alias]
//             )
//         ) &&
//       item.isOptional()
//         ? "?"
//         : ""
//     }: ${stringifyType(item.getType())}`
//     )
//     .join(", \n")}
// }
// `;
// }

export interface GenerateTypeScriptObjectOptions<T> {
  overrideName?: string;
  overrideExtends?: string | false;
  defaultValues?: Partial<T>;
}

/**
 * Generates a TypeScript object for the given reflection class.
 *
 * @param reflection - The reflection class to generate the object for.
 * @param options - Options for generating the object.
 * @returns A string containing the TypeScript object definition.
 */
export function generateTypeScriptObject<T extends Record<string, any>>(
  reflection: ReflectionClass<T>,
  options: GenerateTypeScriptObjectOptions<T> = {}
) {
  if (!reflection) {
    return "";
  }

  return `
/**
 * ${
   reflection.getDescription() ||
   `${titleCase(options.overrideName || reflection.getClassName() || reflection.getName())} object instance`
 }.
 */
export const ${camelCase(options.overrideName || reflection.getName())}${
    options.overrideExtends !== false &&
    (options.overrideExtends || reflection.getSuperReflectionClass()?.getName())
      ? `: ${options.overrideExtends || reflection.getSuperReflectionClass()?.getName()}`
      : ""
  } = {
  ${reflection
    .getProperties()
    .filter(
      item =>
        !item.isIgnored() &&
        !isUndefined(
          options.defaultValues?.[item.getNameAsString()] ??
            item.getAlias().reduce((ret, alias) => {
              if (
                isUndefined(ret) &&
                !isUndefined(
                  (options.defaultValues as Record<string, any>)?.[alias]
                )
              ) {
                return (options.defaultValues as Record<string, any>)?.[alias];
              }

              return ret;
            }, undefined) ??
            item.getDefaultValue()
        )
    )
    .sort((a, b) =>
      (a.isReadonly() && b.isReadonly()) || (!a.isReadonly() && !b.isReadonly())
        ? a.getNameAsString().localeCompare(b.getNameAsString())
        : a.isReadonly()
          ? 1
          : -1
    )
    .map(
      item =>
        `  /**
  * ${
    item.getDescription() ||
    item.getTitle() ||
    titleCase(item.getNameAsString())
  }
  *
  * @title ${item.getTitle() || titleCase(item.getNameAsString())}${
    item.getAlias().length
      ? `
  ${item
    .getAlias()
    .map(alias => ` * @alias ${alias}`)
    .join("\n")}`
      : ""
  }${
    item.getDomain()
      ? `
  * @domain ${item.getDomain()}`
      : ""
  }${
    item.getPermission().length
      ? `
  ${item
    .getPermission()
    .map(permission => `  * @permission ${permission}`)
    .join("\n")}`
      : ""
  }${
    item.isInternal()
      ? `
  * @internal`
      : ""
  }${
    item.isReadonly()
      ? `
  * @readonly`
      : ""
  }${
    item.isIgnored()
      ? `
  * @ignored`
      : ""
  }${
    item.isHidden()
      ? `
  * @hidden`
      : ""
  }
  */
  ${item.getNameAsString()}: ${stringifyValue(
    item.getType(),
    options.defaultValues?.[item.getNameAsString()] ??
      item.getAlias().reduce((ret, alias) => {
        if (
          isUndefined(ret) &&
          !isUndefined((options.defaultValues as Record<string, any>)?.[alias])
        ) {
          return (options.defaultValues as Record<string, any>)?.[alias];
        }

        return ret;
      }, undefined) ??
      item.getDefaultValue()
  )}`
    )
    .join(", \n")}
};
`;
}
