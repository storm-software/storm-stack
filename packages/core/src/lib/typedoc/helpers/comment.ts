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

import * as Handlebars from "handlebars";
import type { CommentDisplayPart } from "typedoc";

function registerCommentHelper() {
  Handlebars.registerHelper("comment", (parts: CommentDisplayPart[]) => {
    const result: string[] = [];
    for (const part of parts) {
      switch (part.kind) {
        case "text":
        case "code":
          result.push(part.text);
          break;
        case "inline-tag":
          switch (part.tag) {
            case "@label":
            case "@inheritdoc":
              break;
            case "@link":
            case "@linkcode":
            case "@linkplain": {
              if (part.target) {
                const url =
                  typeof part.target === "string"
                    ? part.target
                    : Handlebars.helpers.relativeURL
                      ? Handlebars.helpers.relativeURL((part.target as any).url)
                      : "";
                const wrap = part.tag === "@linkcode" ? "`" : "";
                result.push(
                  url ? `[${wrap}${part.text}${wrap}](${url})` : part.text
                );
              } else {
                result.push(part.text);
              }
              break;
            }
            default:
              result.push(`{${part.tag} ${part.text}}`);
              break;
          }
          break;
        default:
          result.push("");
      }
    }

    return result
      .join("")
      .split("\n")
      .filter(line => !line.startsWith("@note"))
      .join("\n");
  });
}

export default registerCommentHelper;
