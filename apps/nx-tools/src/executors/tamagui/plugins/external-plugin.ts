// Must not start with "/" or "./" or "../"
const NON_NODE_MODULE_RE = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/;

export type ExternalPluginOptions = {
  patterns?: (string | RegExp)[];
  skipNodeModulesBundle?: boolean;
  disabled?: boolean;
};

export const createExternalPlugin = ({
  patterns,
  skipNodeModulesBundle,
  disabled
}: ExternalPluginOptions) => {
  return {
    name: "external",
    setup(build: any) {
      if (disabled) {
        return;
      }

      if (skipNodeModulesBundle) {
        build.onResolve({ filter: NON_NODE_MODULE_RE }, (args: { path: any }) => ({
          path: args.path,
          external: true
        }));
      }

      if (!patterns || patterns.length === 0) {
        return;
      }

      build.onResolve({ filter: /.*/ }, (args: { path: string }) => {
        const external = patterns.some((p) => {
          if (p instanceof RegExp) {
            return p.test(args.path);
          }
          return args.path === p;
        });

        if (external) {
          return { path: args.path, external };
        }

        return null;
      });
    }
  };
};
