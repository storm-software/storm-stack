import { isFile } from "@storm-stack/file-system";
import { ResolverFactory } from "oxc-resolver";

/**
 * Create a resolver factory
 *
 * @param tsconfig - The path to the tsconfig file
 * @returns The resolver factory
 */
export const createResolver = (tsconfig: string): ResolverFactory => {
	const resolverFactory = new ResolverFactory({
		tsconfig: {
			configFile: isFile(tsconfig) ? tsconfig : `${tsconfig}/tsconfig.json`,
		},
		descriptionFiles: ["package.json", "plugin.json"],
	});

	return resolverFactory;
};
