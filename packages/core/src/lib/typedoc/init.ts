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

import { findFileName } from "@stryke/path/file-path-fns";
import { joinPaths } from "@stryke/path/join-paths";
import { writeFile } from "node:fs/promises";
import { sep } from "node:path";
import {
  Application,
  Converter,
  PackageJsonReader,
  PageEvent,
  ProjectReflection,
  ReflectionKind,
  TSConfigReader,
  TypeDocReader
} from "typedoc";
import { Context } from "../../types/context";

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
  (frontmatterObject?: Record<string, any>) =>
  (event: PageEvent<{ name: string }>) => {
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

const buildNavigationFromProjectReflection = (
  baseUrl = "",
  project: { groups: ReflectionGroupInput[] }
) => {
  const baseUrlWithoutTrailingSlash = baseUrl.replace(/\/$/gm, "");
  const result: Navigation = { type: "flat" };

  const isGroupOfModules = (group: ReflectionGroupInput) =>
    group.title === "Modules";
  const reflectionToNavItem = (reflection: { name: any; url: any }) => {
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

export interface InitTypedocOptions {
  outputPath: string;
  baseUrl?: string;
  entryPoints?: Array<{ name: string; path: string }>;
}

export interface GenerateDocsOptions {
  frontmatter?: Record<string, any>;
  outputPath?: string;
  project: ProjectReflection;
}

/**
 * Initialize Typedoc with the given options.
 *
 * @param context - The Storm Stack context
 * @param options - Options to initialize Typedoc with
 * @returns An object containing methods to generate docs, generate navigation JSON, and get reflections.
 */
export const initTypedoc = async (
  context: Context,
  options: InitTypedocOptions
) => {
  const { baseUrl = "/docs/", outputPath } = options;

  const entryPoints =
    options.entryPoints ??
    context.entry.map(entry => ({
      name:
        entry.name ||
        entry.output ||
        findFileName(entry.file, {
          withExtension: false
        }),
      path: joinPaths(context.options.projectRoot, entry.file)
    }));

  // Hack to make sure entrypoints will be loaded
  // await writeFile(
  //   resolve(__dirname, "./tsconfig.generic.json"),
  //   JSON.stringify({
  //     compilerOptions: {
  //       baseUrl: ".",
  //       paths: entryPoints?.reduce((paths, { name, path }) => {
  //         if (name) {
  //           paths[name] = [path];
  //         }

  //         return paths;
  //       }, {})
  //     },
  //     include: entryPoints?.map(e => e.path)
  //   })
  // );

  const app = await Application.bootstrapWithPlugins(
    {
      ...typedocConfig,
      ...markdownPluginConfig,
      gitRevision: context.options.branch || "main",
      tsconfig: context.tsconfig.tsconfigFilePath,
      exclude: context.tsconfig.tsconfigJson.exclude?.filter(
        Boolean
      ) as string[],
      out: outputPath,
      basePath: baseUrl,
      entryPoints: entryPoints?.map(e => e.path),
      plugin: [
        "typedoc-plugin-markdown",
        "@storm-stack/core/lib/typedoc/plugin"
      ],
      theme: "storm-stack",
      readme: "none",
      excludePrivate: true,
      hideGenerator: true
      // tsconfig: resolve(__dirname, "./tsconfig.generic.json")
    },
    [new TypeDocReader(), new PackageJsonReader(), new TSConfigReader()]
  );

  app.options.addReader(new TSConfigReader());
  app.converter.on(
    Converter.EVENT_CREATE_DECLARATION,
    onDeclaration(entryPoints)
  );

  const getReflections = async () => app.convert();
  const generateDocs = async (opts: GenerateDocsOptions) => {
    const { outputPath: outputFolder, project, frontmatter } = opts;
    app.renderer.on(PageEvent.END, onRendererPageEnd(frontmatter));

    await app.generateDocs(project, outputFolder || outputPath);
  };
  const generateNavigationJSON = async (
    project: any,
    outputFolder = outputPath
  ) => {
    const navigation = buildNavigationFromProjectReflection(baseUrl, project);

    await writeFile(
      `${removeTrailingSlash(outputFolder)}/nav.json`,
      JSON.stringify(navigation)
    );
  };

  return {
    app,
    generateDocs,
    generateNavigationJSON,
    getReflections
  };
};

export default initTypedoc;
