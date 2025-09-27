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
  Children,
  childrenArray,
  For,
  List,
  Prose,
  Show,
  splitProps
} from "@alloy-js/core";
import { JSDocExampleProps, ParameterDescriptor } from "@alloy-js/typescript";
import { stringifyDefaultValue } from "@storm-stack/core/lib/deepkit/utilities";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { isUndefined } from "@stryke/type-checks/is-undefined";
import { ComponentProps } from "../../types/templates";

export interface TSDocProps extends ComponentProps {
  heading?: Children;
}

/**
 * Generates a TypeScript interface for the given reflection class.
 */
export function TSDoc(props: TSDocProps) {
  const [{ children, heading }] = splitProps(props, ["children", "heading"]);

  return (
    <>
      /**
      <align string=" * ">
        <hbr />
        <Show when={!isUndefined(heading)}>
          {heading}
          <hbr />
          <Show
            when={
              !isUndefined(children) && childrenArray(() => children).length > 0
            }>
            <hbr />
          </Show>
        </Show>
        <Show
          when={
            !isUndefined(children) && childrenArray(() => children).length > 0
          }>
          <List>{childrenArray(() => children)}</List>
        </Show>
      </align>
      <hbr />
      {` */`}
      <hbr />
    </>
  );
}

export interface TSDocTagProps extends ComponentProps {
  tag: string;
}

/**
 * Create a TSDoc `@<props.tag>` tag.
 */
export function TSDocTag(props: TSDocTagProps) {
  const [{ children, tag }] = splitProps(props, ["children", "tag"]);

  return (
    <>
      {`@${tag} `}
      <Show when={Boolean(children)}>
        <align width={2}>
          <Prose>{children}</Prose>
        </align>
      </Show>
      <hbr />
    </>
  );
}

export interface TSDocParamsProps {
  parameters: ParameterDescriptor[] | string[];
}

/**
 * A component that creates a TSDoc block with `@param` tags for each parameter.
 */
export function TSDocParams(props: TSDocParamsProps) {
  const parameters = normalizeParametersForDoc(props.parameters);

  return (
    <For each={parameters}>
      {param => (
        <TSDocParam name={param.name} optional={param.optional}>
          {param.doc}
        </TSDocParam>
      )}
    </For>
  );
}

function normalizeParametersForDoc(
  parameters: ParameterDescriptor[] | string[]
): ParameterDescriptor[] {
  if (parameters.some(p => typeof p === "string")) {
    return [];
  }

  return parameters as ParameterDescriptor[];
}

/**
 * Create a TSDoc `@title` tag.
 */
export function TSDocTitle(props: ComponentProps) {
  const [{ children }, rest] = splitProps(props, ["children"]);

  return (
    <TSDocTag {...rest} tag="title">
      {children}
    </TSDocTag>
  );
}

/**
 * Create a TSDoc `@domain` tag.
 */
export function TSDocDomain(props: ComponentProps) {
  const [{ children }, rest] = splitProps(props, ["children"]);

  return (
    <TSDocTag {...rest} tag="domain">
      {children}
    </TSDocTag>
  );
}

/**
 * Create a TSDoc `@alias` tag.
 */
export function TSDocAlias(props: ComponentProps) {
  const [{ children }, rest] = splitProps(props, ["children"]);

  return (
    <TSDocTag {...rest} tag="alias">
      {children}
    </TSDocTag>
  );
}

/**
 * Create a TSDoc `@permission` tag.
 */
export function TSDocPermission(props: ComponentProps) {
  const [{ children }, rest] = splitProps(props, ["children"]);

  return (
    <TSDocTag {...rest} tag="permission">
      {children}
    </TSDocTag>
  );
}

export interface TSDocDefaultValueProps extends ComponentProps {
  value: any;
}

/**
 * Create a TSDoc `@defaultValue` tag.
 */
export function TSDocDefaultValue(props: TSDocDefaultValueProps) {
  return (
    <>
      {"@defaultValue "}
      <Show when={!isUndefined(props.value)}>
        <align width={2}>
          <Prose>{stringifyDefaultValue(props.value)}</Prose>
        </align>
      </Show>
      <hbr />
    </>
  );
}

/**
 * Create a TSDoc `@remarks` tag.
 */
export function TSDocRemarks(props: ComponentProps) {
  return (
    <>
      {"@remarks "}
      <hbr />
      <List hardline={true}>{childrenArray(() => props.children)}</List>
    </>
  );
}

/**
 * Create a TSDoc `@see` tag.
 */
export function TSDocLink(props: ComponentProps) {
  return <TSDocTag {...props} tag="see" />;
}

export interface TSDocExampleProps extends JSDocExampleProps {
  /**
   * Whether the file is a TSX file.
   *
   * @defaultValue false
   */
  tsx?: boolean;
}

/**
 * Create a TSDoc `@example` tag.
 */
export function TSDocExample(props: TSDocExampleProps) {
  const [{ tsx, fenced = true, language, children }] = splitProps(props, [
    "tsx",
    "fenced",
    "language",
    "children"
  ]);

  return (
    <>
      {"@example "}
      <hbr />
      <Show when={fenced}>
        ```{language || (tsx ? "tsx" : "ts")}
        <hbr />
      </Show>
      {children}
      <Show when={fenced}>
        <hbr />
        ```
      </Show>
    </>
  );
}

/**
 * Create a TSDoc `@readonly` tag.
 */
export function TSDocReadonly() {
  return <TSDocTag tag="readonly" />;
}

/**
 * Create a TSDoc `@internal` tag.
 */
export function TSDocInternal() {
  return <TSDocTag tag="internal" />;
}

/**
 * Create a TSDoc `@ignore` tag.
 */
export function TSDocIgnore() {
  return <TSDocTag tag="ignore" />;
}

/**
 * Create a TSDoc `@hidden` tag.
 */
export function TSDocHidden() {
  return <TSDocTag tag="hidden" />;
}

export interface TSDocAttributesTagsProps {
  title?: string;
  alias?: string[];
  permission?: string[];
  domain?: string;
  readonly?: boolean;
  internal?: boolean;
  ignore?: boolean;
  hidden?: boolean;
  defaultValue?: any;
}

/**
 * Generates a TypeScript interface property for the given reflection class.
 */
export function TSDocAttributesTags(props: TSDocAttributesTagsProps) {
  const [
    {
      title,
      alias,
      permission,
      domain,
      readonly,
      internal,
      ignore,
      hidden,
      defaultValue
    }
  ] = splitProps(props, [
    "title",
    "alias",
    "permission",
    "domain",
    "readonly",
    "internal",
    "ignore",
    "hidden",
    "defaultValue"
  ]);

  return (
    <>
      <Show when={isSetString(title)}>
        <TSDocTitle>{title}</TSDocTitle>
      </Show>
      <Show when={!isUndefined(alias) && alias.length > 0}>
        <For each={alias ?? []}>
          {alias => <TSDocAlias>{alias}</TSDocAlias>}
        </For>
      </Show>
      <Show when={isSetString(domain)}>
        <TSDocDomain>{domain}</TSDocDomain>
      </Show>
      <Show when={!isUndefined(permission) && permission.length > 0}>
        <For each={permission ?? []}>
          {permission => <TSDocPermission>{permission}</TSDocPermission>}
        </For>
      </Show>
      <Show when={readonly === true}>
        <TSDocReadonly />
      </Show>
      <Show when={internal === true}>
        <TSDocInternal />
      </Show>
      <Show when={ignore === true}>
        <TSDocIgnore />
      </Show>
      <Show when={hidden === true}>
        <TSDocHidden />
      </Show>
      <Show when={!isUndefined(defaultValue)}>
        <TSDocDefaultValue value={defaultValue} />
      </Show>
    </>
  );
}

export interface TSDocParamProps {
  name: Children;
  children?: Children;
  optional?: boolean;
  defaultValue?: Children;
}

/**
 * Create a TSDoc parameter set off with `@param`.
 */
export function TSDocParam(props: TSDocParamProps) {
  return (
    <>
      {"@param "}
      <TSDocParamName
        name={props.name}
        optional={props.optional}
        defaultValue={props.defaultValue}
      />
      <TSDocParamDescription children={props.children} />
    </>
  );
}

interface TSDocParamNameProps {
  name: Children;
  optional?: boolean;
  defaultValue?: Children;
}

function TSDocParamName(props: TSDocParamNameProps) {
  return (
    <>
      <Show when={props.optional}>{"["}</Show>
      {props.name}
      <Show when={Boolean(props.defaultValue)}>={props.defaultValue}</Show>
      <Show when={props.optional}>{"]"}</Show>
    </>
  );
}

interface TSDocParamDescriptionProps {
  children?: Children;
}

function TSDocParamDescription(props: TSDocParamDescriptionProps) {
  return (
    <Show when={Boolean(props.children)}>
      {" - "}
      <align width={2}>
        <Prose>{props.children}</Prose>
      </align>
    </Show>
  );
}

/**
 * Create a TSDoc `@returns` tag.
 */
export function TSDocReturns(props: ComponentProps) {
  return <TSDocTag {...props} tag="returns" />;
}

/**
 * Create a TSDoc `@throws` tag.
 */
export function TSDocThrows(props: ComponentProps) {
  return <TSDocTag {...props} tag="throws" />;
}

export interface TSDocModuleProps extends ComponentProps {
  /**
   * the prefix for the builtin module name
   *
   * @defaultValue "storm"
   */
  prefix?: string;

  /**
   * The name of the module
   *
   * @remarks
   * This will be used in the `@module` tag as well as the import path for the module, e.g. `storm:<name>`.
   *
   * @example
   * ```ts
   * import { MyModule } from "storm:my-module";
   * ```
   */
  name: Children;
}

/**
 * Generates a TSDoc `@module` tag for the given module name.
 */
export function TSDocModule(props: TSDocModuleProps) {
  const [{ children, name, prefix }] = splitProps(props, [
    "children",
    "name",
    "prefix"
  ]);

  return (
    <>
      /**
      <align string=" * ">
        <hbr />
        <Show when={Boolean(children)}>
          <List hardline={true}>{childrenArray(() => children)}</List>
          <hbr />
          <hbr />
        </Show>
        {"@module "}
        {prefix || "storm"}:{name}
      </align>
      <hbr />
      {` */`}
    </>
  );
}
