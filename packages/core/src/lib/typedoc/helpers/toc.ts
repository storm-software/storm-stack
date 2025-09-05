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
import type {
  DeclarationReflection,
  ProjectReflection,
  ReflectionGroup
} from "typedoc";
import { ReflectionKind } from "typedoc";
import { StormStackMarkdownTheme } from "./markdown-theme";

export function escapeChars(str: string) {
  return str
    .replace(/>/g, "\\>")
    .replace(/_/g, "\\_")
    .replace(/`/g, "\\`")
    .replace(/\|/g, "\\|");
}
export function stripLineBreaks(str: string) {
  return str
    ? str
        .replace(/\n/g, " ")
        .replace(/\r/g, " ")
        .replace(/\t/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
    : "";
}

function registerTOCHelper(theme: StormStackMarkdownTheme) {
  function innerRegisterTOCHelper(
    this: ProjectReflection | DeclarationReflection
  ) {
    const md: string[] = [];

    const { hideInPageTOC } = theme;

    const isVisible = this.groups?.some(group =>
      group.allChildrenHaveOwnDocument()
    );

    function pushGroup(group: ReflectionGroup, md: string[]) {
      const children = group.children.map(child => {
        const propertyType = [
          ReflectionKind.Property,
          ReflectionKind.Variable
        ].includes(child.kind)
          ? `: ${getPropertyType(child)}`
          : "";

        return `- [${escapeChars(
          child.name
        )}](${Handlebars.helpers.relativeURL ? Handlebars.helpers.relativeURL(child.url) : child.url})${propertyType}`;
      });
      md.push(children.join("\n"));
    }

    if ((!hideInPageTOC && this.groups) || (isVisible && this.groups)) {
      if (!hideInPageTOC) {
        md.push(`## Table of contents\n\n`);
      }
      const headingLevel = hideInPageTOC ? `##` : `###`;
      this.groups?.forEach(group => {
        const groupTitle = group.title;
        if (group.categories) {
          group.categories.forEach(category => {
            md.push(`${headingLevel} ${category.title} ${groupTitle}\n\n`);
            pushGroup(category as any, md);
            md.push("\n");
          });
        } else if (!hideInPageTOC || group.allChildrenHaveOwnDocument()) {
          md.push(`${headingLevel} ${groupTitle}\n\n`);
          pushGroup(group, md);
          md.push("\n");
        }
      });
    }
    return md.length > 0 ? md.join("\n") : null;
  }

  Handlebars.registerHelper("toc", innerRegisterTOCHelper);
}

function getPropertyType(property: any) {
  if (property.getSignature) {
    return property.getSignature.type;
  }
  if (property.setSignature) {
    return property.setSignature.type;
  }
  return property.type ? property.type : property;
}

export default registerTOCHelper;
