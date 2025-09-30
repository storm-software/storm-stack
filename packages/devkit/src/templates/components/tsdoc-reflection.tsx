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

import {
  childrenArray,
  code,
  computed,
  List,
  Show,
  splitProps
} from "@alloy-js/core";
import { titleCase } from "@stryke/string-format/title-case";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { isString } from "@stryke/type-checks/is-string";
import { isUndefined } from "@stryke/type-checks/is-undefined";
import {
  useReflectionClass,
  useReflectionMethod,
  useReflectionProperty
} from "../context";
import { TSDoc, TSDocAttributesTags, TSDocProps } from "./tsdoc";

/**
 * Generates a TypeScript interface property for the given reflection class.
 */
export function TSDocReflectionClass<
  T extends Record<string, any> = Record<string, any>
>(props: TSDocProps) {
  const [{ children }, rest] = splitProps(props, ["children"]);

  const reflectionClass = useReflectionClass<T>();

  const title = computed(
    () =>
      reflectionClass.reflection.getTitle() ||
      titleCase(reflectionClass.reflection.getName())
  );
  const alias = computed(() => reflectionClass.reflection.getAlias());
  const domain = computed(() => reflectionClass.reflection.getDomain());
  const permission = computed(() => reflectionClass.reflection.getPermission());
  const readonly = computed(() => reflectionClass.reflection.isReadonly());
  const internal = computed(() => reflectionClass.reflection.isInternal());
  const ignore = computed(() => reflectionClass.reflection.isIgnored());
  const hidden = computed(() => reflectionClass.reflection.isHidden());

  if (!reflectionClass.reflection.getName()) {
    return null;
  }

  return (
    <TSDoc {...rest} heading={reflectionClass.reflection.getDescription()}>
      <Show
        when={
          isSetString(title.value) ||
          (!isUndefined(alias.value) && alias.value.length > 0) ||
          (!isUndefined(permission.value) && permission.value.length > 0) ||
          isSetString(domain.value) ||
          !isUndefined(readonly.value) ||
          !isUndefined(internal.value) ||
          !isUndefined(ignore.value) ||
          !isUndefined(hidden.value)
        }>
        <TSDocAttributesTags
          title={title.value}
          alias={alias.value}
          domain={domain.value}
          permission={permission.value}
          readonly={readonly.value}
          internal={internal.value}
          ignore={ignore.value}
          hidden={hidden.value}
        />
      </Show>
      <Show
        when={Boolean(children) && childrenArray(() => children).length > 0}>
        <List>{childrenArray(() => children)}</List>
      </Show>
    </TSDoc>
  );
}

/**
 * Generates a TypeScript interface property for the given reflection class.
 */
export function TSDocReflectionProperty(props: TSDocProps) {
  const [{ children }, rest] = splitProps(props, ["children"]);

  const context = useReflectionProperty();

  return (
    <TSDoc heading={context.getDescription()} {...rest}>
      <TSDocAttributesTags
        title={context.getTitle()}
        alias={context.getAlias()}
        domain={context.getDomain()}
        permission={context.getPermission()}
        readonly={context.isReadonly()}
        internal={context.isInternal()}
        ignore={context.isIgnored()}
        hidden={context.isHidden()}
      />
      <Show
        when={Boolean(children) && childrenArray(() => children).length > 0}>
        <List>{childrenArray(() => children)}</List>
      </Show>
    </TSDoc>
  );
}

/**
 * Generates a TypeScript interface property for the given reflection class.
 */
export function TSDocReflectionMethod(props: TSDocProps) {
  const [{ children }, rest] = splitProps(props, ["children"]);

  const context = useReflectionMethod();

  return (
    <TSDoc
      heading={
        context.getDescription() ||
        (isString(context.getName())
          ? code`${String(context.getName())} method definition`
          : undefined)
      }
      {...rest}>
      <TSDocAttributesTags
        title={context.getTitle()}
        alias={context.getAlias()}
        domain={context.getDomain()}
        permission={context.getPermission()}
        readonly={context.isReadonly()}
        internal={context.isInternal()}
        ignore={context.isIgnored()}
        hidden={context.isHidden()}
      />
      <Show
        when={Boolean(children) && childrenArray(() => children).length > 0}>
        <List>{childrenArray(() => children)}</List>
      </Show>
    </TSDoc>
  );
}
