export const aliasPlugin = (config: { [x: string]: string }) => {
  const alias = config && Object.keys(config);
  return {
    name: "path-alias",

    setup(build: any) {
      if (!alias || !alias.length) {
        return;
      }
      const main = (key: string, _args: any) => {
        const targetPath = config?.[key]?.replace(/\/$/, "");
        return {
          path: targetPath
        };
      };

      for (const aliasItem of alias) {
        build.onResolve({ filter: new RegExp(`^.*${aliasItem}$`) }, (args: any) => {
          return main(aliasItem, args);
        });
        build.onResolve({ filter: new RegExp(`^.*\\/${aliasItem}\\/.*$`) }, (args: any) => {
          return main(aliasItem, args);
        });
      }
    }
  };
};
