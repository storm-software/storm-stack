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

import type {
  RuleListener,
  RuleWithMeta,
  RuleWithMetaAndName
} from "@typescript-eslint/utils/eslint-utils";
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import defu from "defu";
import type { Rule } from "eslint";

// @keep-sorted
const hasDocs = new Set([
  "consistent-chaining",
  "consistent-list-newline",
  "curly",
  "if-newline",
  "import-dedupe",
  "indent-unindent",
  "top-level-function"
]);

const blobUrl =
  "https://github.com/storm-software/storm-stack/blob/main/devkit/eslint-plugin/src/rules";

const docsUrl =
  "https://docs.stormsoftware.com/projects/storm-stack/eslint-plugin/rules";

export type RuleModule<T extends readonly unknown[]> = Rule.RuleModule & {
  defaultOptions: T;
};

/**
 * Creates reusable function to create rules with default options and docs URLs.
 *
 * @param urlCreator - Creates a documentation URL for a given rule name.
 * @returns Function to create a rule with the docs URL format.
 */
function RuleCreator(urlCreator: (name: string) => string) {
  // This function will get much easier to call when this is merged https://github.com/Microsoft/TypeScript/pull/26349
  // TODO - when the above PR lands; add type checking for the context.report `data` property
  return function createNamedRule<
    TOptions extends readonly any[],
    TMessageIds extends string
  >({
    name,
    meta,
    ...rule
  }: Readonly<
    RuleWithMetaAndName<TOptions, TMessageIds>
  >): RuleModule<TOptions> {
    return createRule<TOptions, TMessageIds>({
      meta: {
        ...meta,
        docs: {
          ...meta.docs,
          url: urlCreator(name)
        }
      },
      ...rule
    });
  };
}

/**
 * Creates a well-typed TSESLint custom ESLint rule without a docs URL.
 *
 * @returns Well-typed TSESLint custom ESLint rule.
 * @remarks It is generally better to provide a docs URL function to RuleCreator.
 */
function createRule<
  TOptions extends readonly any[],
  TMessageIds extends string
>({
  create,
  defaultOptions,
  meta
}: Readonly<RuleWithMeta<TOptions, TMessageIds>>): RuleModule<TOptions> {
  return {
    create: ((
      context: Readonly<RuleContext<TMessageIds, TOptions>>
    ): RuleListener => {
      const optionsWithDefault = context.options.map((options, index) => {
        return defu(defaultOptions[index] ?? {}, options);
      }) as unknown as TOptions;

      return create(context, optionsWithDefault);
    }) as any,
    defaultOptions,
    meta: meta as any
  };
}

export const createEslintRule = RuleCreator(ruleName =>
  hasDocs.has(ruleName)
    ? `${docsUrl}/${ruleName}.md`
    : `${blobUrl}/${ruleName}.test.ts`
) as any as <TOptions extends readonly unknown[], TMessageIds extends string>({
  name,
  meta,
  ...rule
}: Readonly<
  RuleWithMetaAndName<TOptions, TMessageIds>
>) => RuleModule<TOptions>;

const warned = new Set<string>();

export function warnOnce(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  // eslint-disable-next-line no-console
  console.warn(message);
}
