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

import { writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  Application,
  Converter,
  PageEvent,
  ReflectionKind,
  TSConfigReader
} from "typedoc";

const __dirname = dirname(fileURLToPath(import.meta.url));

const objectToFrontmatter = (object: Record<string, any> = {}) =>
  Object.entries(object)
    .filter(([, value]) => {
      // Filter out empty values and non-string values
      return (
        (value !== undefined &&
          value !== null &&
          value !== "" &&
          typeof value === "string") ||
        (Array.isArray(value) && value.length > 0)
      );
    })
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

const onRendererPageEnd =
  frontmatterObject => (event: PageEvent<{ name: string }>) => {
    if (!event.contents) {
      return;
    } else if (/README\.md$/.test(event.url)) {
      event.preventDefault();
      return;
    }

    const frontmatter = `---
title: '${event.model.name}'
${objectToFrontmatter(frontmatterObject)}
---

`;

    event.contents = frontmatter + event.contents;
  };

interface NavigationItem {
  title: string;
  url: string;
}

interface NavigationGroup {
  items: NavigationItem[];
  name: string;
}

interface Reflection {
  name: string;
  url: string;
  groups?: ReflectionGroup[];
}

interface ReflectionGroup {
  title: string;
  children: Reflection[];
}

interface Navigation {
  type: "flat" | "modular";
  modules?: NavigationGroup[];
  items?: NavigationItem[];
}

interface ReflectionGroupInput {
  title: string;
  children: Reflection[];
}

const buildNavigationFromProjectReflection = (baseUrl = "", project) => {
  const baseUrlWithoutTrailingSlash = baseUrl.replace(/\/$/gm, "");
  const result: Navigation = { type: "flat" };

  const isGroupOfModules = group => group.title === "Modules";
  const reflectionToNavItem = reflection => {
    return {
      title: reflection.name,
      url: `${baseUrlWithoutTrailingSlash}/${reflection.url}`.replace(
        /\.md$/,
        ""
      )
    };
  };

  const modulesGroupToNavigationGroup = (
    module: Reflection
  ): NavigationGroup => ({
    items: (module.groups ?? []).flatMap((group: ReflectionGroup) =>
      group.children.map(reflectionToNavItem)
    ),
    name: module.name
  });

  const navFromReflectionGroups = (
    groups: ReflectionGroupInput[],
    nav: Navigation = { type: "flat" }
  ): Navigation => {
    groups.forEach((group: ReflectionGroupInput) => {
      if (isGroupOfModules(group)) {
        nav.type = "modular";
        nav.modules = group.children.map(modulesGroupToNavigationGroup);
      } else {
        nav.items = nav?.items?.length ? nav.items : [];
        nav.items = nav.items.concat(
          group.children.flatMap(reflectionToNavItem)
        );
      }
    });

    return nav;
  };

  return navFromReflectionGroups(project.groups, result);
};

const onDeclaration =
  (entryPoints: Array<{ name: string; path: string }> = []) =>
  (context: any, reflection: any) => {
    if (reflection.kind === ReflectionKind.Module) {
      const matchingEntryPoint = entryPoints.find(
        entryPoint => entryPoint.path === reflection.sources[0].fullFileName
      );

      reflection.name = matchingEntryPoint?.name ?? reflection.name;
    }
  };

const typedocConfig = {
  excludeExternals: true,
  excludeInternal: true,
  excludePrivate: true,
  excludeProtected: true,
  githubPages: false
};

const markdownPluginConfig = {
  hideBreadcrumbs: true,
  hideInPageTOC: true,
  hidePageHeader: true,
  hidePageTitle: true
};

const removeTrailingSlash = (pathString = "") =>
  pathString.endsWith(sep)
    ? pathString.slice(0, pathString.length - 1)
    : pathString;

export const initAstroTypedoc = async ({
  baseUrl = "/docs/",
  entryPoints
}: {
  baseUrl?: string;
  entryPoints?: Array<{ name: string; path: string }>;
}) => {
  // Hack to make sure entrypoints will be loaded
  await writeFile(
    resolve(__dirname, "./tsconfig.generic.json"),
    JSON.stringify({
      compilerOptions: {
        baseUrl: ".",
        paths: entryPoints?.reduce((paths, { name, path }) => {
          if (name) {
            paths[name] = [path];
          }

          return paths;
        }, {})
      },
      include: entryPoints?.map(e => e.path)
    })
  );

  const app = await Application.bootstrapWithPlugins({
    ...typedocConfig,
    ...markdownPluginConfig,
    basePath: baseUrl,
    entryPoints: entryPoints?.map(e => e.path),
    plugin: ["typedoc-plugin-markdown", resolve(__dirname, "./theme.js")],
    readme: "none",
    theme: "custom-markdown-theme",
    tsconfig: resolve(__dirname, "./tsconfig.generic.json")
  });

  app.options.addReader(new TSConfigReader());
  app.converter.on(
    Converter.EVENT_CREATE_DECLARATION,
    onDeclaration(entryPoints)
  );

  const getReflections = async () => app.convert();
  const generateDocs = async ({
    frontmatter,
    outputFolder = "src/pages/docs",
    project
  }) => {
    app.renderer.on(PageEvent.END, onRendererPageEnd(frontmatter));

    await app.generateDocs(project, outputFolder);
  };
  const generateNavigationJSON = async (project, outputFolder) => {
    const navigation = buildNavigationFromProjectReflection(baseUrl, project);

    await writeFile(
      `${removeTrailingSlash(outputFolder)}/nav.json`,
      JSON.stringify(navigation)
    );
  };

  return {
    generateDocs,
    generateNavigationJSON,
    getReflections
  };
};

export default initAstroTypedoc;
