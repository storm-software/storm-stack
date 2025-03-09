import { createEslintRule } from "../helpers/create-rule";

export const RULE_NAME = "authenticity-token";
export type MessageIds = "formCsrfTokenUsage";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "disallow usage of CSRF tokens in JavaScript"
    },
    messages: {
      formCsrfTokenUsage:
        "Form CSRF tokens (authenticity tokens) should not be created in JavaScript and their values should not be used directly for XHR requests."
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    function checkAuthenticityTokenUsage(node, str) {
      if (str.includes("authenticity_token")) {
        context.report({
          node,
          messageId: "formCsrfTokenUsage"
        });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === "string") {
          checkAuthenticityTokenUsage(node, node.value);
        }
      }
    };
  }
});
