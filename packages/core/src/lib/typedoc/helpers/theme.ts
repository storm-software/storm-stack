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

import type { PageEvent, Reflection, RenderTemplate } from "typedoc";
import { ReflectionKind } from "typedoc";
import { MarkdownTheme } from "typedoc-plugin-markdown/dist/theme";
import comment from "./comment";
import toc from "./toc";

/**
 * The MarkdownTheme is based on TypeDoc's DefaultTheme @see https://github.com/TypeStrong/typedoc/blob/master/src/lib/output/themes/DefaultTheme.ts.
 * - html specific components are removed from the renderer
 * - markdown specific components have been added
 */
export default class StormStackMarkdownTheme extends MarkdownTheme {
  constructor(renderer) {
    super(renderer);
    toc(this);
    comment();
  }

  override render(
    page: PageEvent<Reflection>,
    template: RenderTemplate<PageEvent<Reflection>>
  ): string {
    return (
      super
        .render(page, template)
        .replace(/\.md/gi, "")
        /**
         * Hack: This is the simplest way to update the urls and make them work
         */
        .replace(/\/devkit\//gi, "/devkit/documents/")
    );
  }

  override get mappings() {
    return [
      {
        kind: [ReflectionKind.Module],
        isLeaf: true,
        directory: ".",
        template: this.getReflectionTemplate()
      },
      {
        kind: [ReflectionKind.Enum],
        isLeaf: false,
        directory: ".",
        template: this.getReflectionTemplate()
      },
      {
        kind: [ReflectionKind.Class],
        isLeaf: false,
        directory: ".",
        template: this.getReflectionTemplate()
      },
      {
        kind: [ReflectionKind.Interface],
        isLeaf: false,
        directory: ".",
        template: this.getReflectionTemplate()
      },
      ...(this.allReflectionsHaveOwnDocument
        ? [
            {
              kind: [ReflectionKind.TypeAlias],
              isLeaf: true,
              directory: ".",
              template: this.getReflectionMemberTemplate()
            },
            {
              kind: [ReflectionKind.Variable],
              isLeaf: true,
              directory: ".",
              template: this.getReflectionMemberTemplate()
            },
            {
              kind: [ReflectionKind.Function],
              isLeaf: true,
              directory: ".",
              template: this.getReflectionMemberTemplate()
            }
          ]
        : [])
    ];
  }

  /**
   * Returns the full url of a given mapping and reflection
   *
   * @param mapping - The mapping object
   * @param reflection - The reflection object
   */
  override toUrl(mapping, reflection) {
    return `${
      (mapping.directory === "." ? "" : `${mapping.directory}/`) +
      this.getUrl(reflection)
    }.md`;
  }
}
