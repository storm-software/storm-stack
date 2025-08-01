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

import path from "node:path";

export enum MessageSeverity {
  Warning = 1,
  Error = 2
}

interface LintMessage {
  ruleId: string | null;
  severity: 1 | 2;
  message: string;
  line: number;
  column: number;
}

export interface LintResult {
  filePath: string;
  messages: LintMessage[];
  errorCount: number;
  warningCount: number;
  output?: string;
  source?: string;
}

function pluginCount(messages: LintMessage[]): {
  nextPluginErrorCount: number;
  nextPluginWarningCount: number;
} {
  let nextPluginWarningCount = 0;
  let nextPluginErrorCount = 0;

  for (let i = 0; i < messages.length; i++) {
    const { severity, ruleId } = messages[i]!;

    if (ruleId?.includes("storm-stack")) {
      if (severity === MessageSeverity.Warning) {
        nextPluginWarningCount += 1;
      } else {
        nextPluginErrorCount += 1;
      }
    }
  }

  return {
    nextPluginErrorCount,
    nextPluginWarningCount
  };
}

function formatMessage(
  dir: string,
  messages: LintMessage[],
  filePath: string
): string {
  let fileName = path.posix.normalize(
    path.relative(dir, filePath).replace(/\\/g, "/")
  );

  if (!fileName.startsWith(".")) {
    fileName = `./${fileName}`;
  }

  let output = `\n${fileName}`;

  for (let i = 0; i < messages.length; i++) {
    const { message, severity, line, column, ruleId } = messages[i]!;

    output += "\n";

    if (line && column) {
      output = `${output + line.toString()}:${column.toString()}  `;
    }

    if (severity === MessageSeverity.Warning) {
      output += `Warning: `;
    } else {
      output += `Error: `;
    }

    output += message;

    if (ruleId) {
      output += `  ${ruleId}`;
    }
  }

  return output;
}

export async function formatResults(
  baseDir: string,
  results: LintResult[],
  format?: (r: LintResult[]) => string | Promise<string>
): Promise<{
  output: string;
  outputWithMessages: string;
  totalPluginErrorCount: number;
  totalPluginWarningCount: number;
}> {
  let totalPluginErrorCount = 0;
  let totalPluginWarningCount = 0;
  const resultsWithMessages = results.filter(
    ({ messages }) => messages?.length
  );

  // Track number of Storm Stack plugin errors and warnings
  resultsWithMessages.forEach(({ messages }) => {
    const res = pluginCount(messages);
    totalPluginErrorCount += res.nextPluginErrorCount;
    totalPluginWarningCount += res.nextPluginWarningCount;
  });

  // Use user defined formatter or built-in custom formatter
  const output = format
    ? await format(resultsWithMessages)
    : resultsWithMessages
        .map(({ messages, filePath }) =>
          formatMessage(baseDir, messages, filePath)
        )
        .join("\n");

  return {
    output,
    outputWithMessages:
      resultsWithMessages.length > 0
        ? `${output}\n\nInfo  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules`
        : "",
    totalPluginErrorCount,
    totalPluginWarningCount
  };
}
