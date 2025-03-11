import { createEslintRule } from "../helpers/create-rule";

export const RULE_NAME = "no-implicit-globals";
export type MessageIds = "assignAsGlobalProperty";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "disallow implicit global variables"
    },
    messages: {
      assignAsGlobalProperty:
        "Implicit global variable, assign as global property instead."
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    return {
      Program(node) {
        const scope = sourceCode.getScope(node)
          ? sourceCode.getScope(node)
          : context.getScope();

        for (const variable of scope.variables) {
          if ((variable as any).writeable) {
            return;
          }

          for (const def of variable.defs) {
            if (
              def.type === "FunctionName" ||
              def.type === "ClassName" ||
              (def.type === "Variable" && def.parent.kind === "const") ||
              (def.type === "Variable" && def.parent.kind === "let")
            ) {
              context.report({
                node: def.node,
                messageId: "assignAsGlobalProperty"
              });
            }
          }
        }
      }
    };
  }
});
