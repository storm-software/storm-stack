import { Context } from "@storm-stack/core/types";
import { Plugin } from "vite";

export const vfsPlugin = (context: Context): Plugin => {
  const runtimeFiles = context.vfs.getRuntime();
  return {
    name: "storm-stack:virtual-file-system",
    resolveId(source, _importer, _options) {
      if (runtimeFiles.some(runtimeFile => runtimeFile.name === source)) {
        return `\0${source}`;
      }
      return;
    },
    load(id, options) {
      const runtimeFile = context.vfs
        .getRuntime()
        .find(runtimeFile => `\0${runtimeFile.name}` === id);
      if (runtimeFile) {
        return runtimeFile.contents?.toString() || "";
      }

      return undefined;
    }
  };
};
