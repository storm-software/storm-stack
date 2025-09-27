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

import type { NodePath, PluginObj } from "@babel/core";
import { smart } from "@babel/template";
import type { MemberExpression, Statement } from "@babel/types";
import { fileURLToPath, pathToFileURL } from "mlly";
import { dirname } from "pathe";

export default function importMetaPathsPlugin(
  _ctx: any,
  opts: { filename?: string }
) {
  return <PluginObj>{
    name: "import-meta-paths",
    visitor: {
      Program(path) {
        const metaUrls: Array<NodePath<MemberExpression>> = [];
        const metaDirnames: Array<NodePath<MemberExpression>> = [];
        const metaFilenames: Array<NodePath<MemberExpression>> = [];

        path.traverse({
          MemberExpression(memberExpPath) {
            const { node } = memberExpPath;

            if (
              node.object.type === "MetaProperty" &&
              node.object.meta.name === "import" &&
              node.object.property.name === "meta" &&
              node.property.type === "Identifier"
            ) {
              switch (node.property.name) {
                case "url": {
                  metaUrls.push(memberExpPath);
                  break;
                }
                case "dirname": {
                  metaDirnames.push(memberExpPath);
                  break;
                }
                case "filename": {
                  metaFilenames.push(memberExpPath);
                  break;
                }
              }
            }
          }
        });

        // Update import.meta.url
        for (const meta of metaUrls) {
          meta.replaceWith(
            smart.ast`${
              opts.filename
                ? JSON.stringify(pathToFileURL(opts.filename))
                : "require('url').pathToFileURL(__filename).toString()"
            }` as Statement
          );
        }

        // Update import.meta.dirname
        for (const metaDirname of metaDirnames) {
          metaDirname.replaceWith(
            smart.ast`${
              opts.filename
                ? JSON.stringify(
                    dirname(fileURLToPath(pathToFileURL(opts.filename)))
                  )
                : "__dirname"
            }` as Statement
          );
        }

        // Update import.meta.filename
        for (const metaFilename of metaFilenames) {
          metaFilename.replaceWith(
            smart.ast`${
              opts.filename
                ? JSON.stringify(fileURLToPath(pathToFileURL(opts.filename)))
                : "__filename"
            }` as Statement
          );
        }
      }
    }
  };
}
