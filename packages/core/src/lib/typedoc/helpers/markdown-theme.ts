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

import { slug } from "github-slugger";
import path from "node:path";
import type { Reflection } from "typedoc";
import {
  MarkdownTheme,
  MarkdownThemeRenderContext
} from "typedoc-plugin-markdown";
import { MarkdownPageEvent } from "../../../types/typedoc";

const externalLinkRegex = /^\w+:/;

export class StormStackMarkdownTheme extends MarkdownTheme {
  public hideInPageTOC = false;

  public override getRenderContext(pageEvent: MarkdownPageEvent<Reflection>) {
    return new StormStackMarkdownThemeContext(
      pageEvent,
      this.application.options
    );
  }
}

class StormStackMarkdownThemeContext extends MarkdownThemeRenderContext {
  public override relativeURL: (
    url: string | undefined | null
  ) => string | null = (url: string | undefined | null): string | null => {
    if (!url) {
      return null;
    } else if (externalLinkRegex.test(url)) {
      return url;
    }

    interface BasePathParsed {
      root: string;
      dir: string;
      base: string;
      ext: string;
      name: string;
    }

    interface FilePathParsed {
      root: string;
      dir: string;
      base: string;
      ext: string;
      name: string;
    }

    // eslint-disable-next-line ts/no-unsafe-call
    const basePath: string = this.options.getValue("basePath");
    const basePathParsed: BasePathParsed = path.parse(basePath);
    const baseUrl: string = basePath.replace(basePathParsed.root, "/");
    const filePathParsed: FilePathParsed = path.parse(url);
    const directory: string = filePathParsed.dir.split(path.sep).join("/");
    const [, anchor] = filePathParsed.base.split("#");

    let constructedUrl: string = typeof baseUrl === "string" ? baseUrl : "";
    constructedUrl += "/";
    constructedUrl += directory.length > 0 ? `${directory}/` : "";
    constructedUrl += filePathParsed.name;
    constructedUrl += anchor && anchor.length > 0 ? `#${slug(anchor)}` : "";

    return constructedUrl;
  };
}
