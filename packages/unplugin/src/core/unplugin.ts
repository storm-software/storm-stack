/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

import { slash } from "@antfu/utils";
import { isPackageExists } from "local-pkg";
import pm from "picomatch";
import type { SourceMap } from "rollup";
import { createUnplugin } from "unplugin";
import type { Options } from "../types";
import { createContext } from "./ctx";

interface TransformInclude {
  (id: string): boolean;
}

interface Transform {
  (
    code: string,
    id: string
  ): Promise<{ code: string; map: SourceMap } | undefined>;
}

interface BuildStart {
  (): Promise<void>;
}

interface BuildEnd {
  (): Promise<void>;
}

interface ViteConfig {
  (config: any): Promise<void | { optimizeDeps: { include: string[] } }>;
}

interface HandleHotUpdate {
  ({ file }: { file: string }): Promise<void>;
}

interface ConfigResolved {
  (config: any): Promise<void>;
}

export default createUnplugin<Options>(options => {
  let ctx = createContext(options);

  const transformInclude: TransformInclude = id => {
    return ctx.filter(element => id === element);
  };

  const transform: Transform = async (code, id) => {
    return ctx.transform(code, id);
  };

  const buildStart: BuildStart = async () => {
    await ctx.scanDirs();
  };

  const buildEnd: BuildEnd = async () => {
    await ctx.writeConfigFiles();
  };

  const viteConfig: ViteConfig = async config => {
    if (options.viteOptimizeDeps === false) return;

    const exclude = config.optimizeDeps?.exclude || [];

    const imports = new Set(
      (await ctx.unimport.getImports())
        .map(i => i.from)
        .filter(
          i => i.match(/^[@a-z]/) && !exclude.includes(i) && isPackageExists(i)
        )
    );

    if (imports.size === 0) return;

    return {
      optimizeDeps: {
        include: [...imports]
      }
    };
  };

  const handleHotUpdate: HandleHotUpdate = async ({ file }) => {
    if (
      ctx.dirs?.some(dir =>
        pm.isMatch(slash(file), slash(typeof dir === "string" ? dir : dir.glob))
      )
    ) {
      await ctx.scanDirs();
    }
  };

  const configResolved: ConfigResolved = async config => {
    if (ctx.root !== config.root) {
      ctx = createContext(options, config.root);
      await ctx.scanDirs();
    }
  };

  return {
    name: "unplugin-storm",
    enforce: "post",
    transformInclude,
    transform,
    buildStart,
    buildEnd,
    vite: {
      config: viteConfig,
      handleHotUpdate,
      configResolved
    }
  };
});
