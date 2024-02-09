import type { ExecutorContext } from "@nx/devkit";
import type { StormConfig } from "@storm-software/config";
import { findWorkspaceRootSafe } from "@storm-software/config-tools";
import {
  type GetConfigParams,
  applyDefaultOptions as baseApplyDefaultOptions,
  tsupExecutorFn,
  withRunExecutor
} from "@storm-software/workspace-tools";
import type { TsupExecutorSchema } from "@storm-software/workspace-tools/src/executors/tsup/schema";
import { StormLog } from "@storm-stack/logging";
import { StormParser } from "@storm-stack/serialization";
import { isFunction, isPrimitive, removeEmptyItems } from "@storm-stack/utilities";
import { removeSync } from "fs-extra";
import { getTamaguiConfig } from "./get-config";
import type { TamaguiExecutorSchema } from "./schema.d";

export async function TamaguiExecutorFn(
  options: TamaguiExecutorSchema,
  context: ExecutorContext,
  config?: StormConfig
) {
  const logger = StormLog.create(config, "Storm-Stack Tamagui Executor");
  logger.info("⚡  Running Storm-Stack Tamagui compile executor on the workspace");

  // #region Apply default options

  const executorOptions = options as Record<string, any>;
  logger.debug(`⚙️  Executor options:
  ${Object.keys(executorOptions)
    .map(
      (key) =>
        `${key}: ${
          !executorOptions[key] || isPrimitive(executorOptions[key])
            ? executorOptions[key]
            : isFunction(executorOptions[key])
              ? "<function>"
              : StormParser.stringify(executorOptions[key])
        }`
    )
    .join("\n")}
  `);

  // #endregion Apply default options

  // #region Prepare build context variables

  if (
    !context.projectsConfigurations?.projects ||
    !context.projectName ||
    !context.projectsConfigurations.projects[context.projectName]
  ) {
    throw new Error(
      "The Storm-Stack Tamagui compile process failed because the context is not valid. Please run this command from a Storm workspace."
    );
  }

  const workspaceRoot = findWorkspaceRootSafe();
  const projectRoot = context.projectsConfigurations.projects[context.projectName]?.root;
  const sourceRoot = context.projectsConfigurations.projects[context.projectName]?.sourceRoot;

  if (!workspaceRoot || !projectRoot || !sourceRoot) {
    throw new Error(
      "The Storm-Stack Tamagui compile process failed because the context is not valid. Please run this command from a Storm workspace."
    );
  }

  // #endregion Prepare build context variables

  // #region Clean output directory

  if (options.clean !== false) {
    logger.info(`🧹 Cleaning output path: ${options.outputPath}`);
    removeSync(options.outputPath);
  }

  // #endregion Clean output directory

  /*const packageJson = readJSONSync(joinPaths("package.json"));

  const pkgMain = packageJson.main;
  const pkgSource = packageJson.source;
  const bundleNative = packageJson.tamagui?.["bundle.native"];
  const bundleNativeTest = packageJson.tamagui?.["bundle.native.test"];
  const pkgModule = packageJson.module;
  const pkgModuleJSX = packageJson["module:jsx"];
  const pkgTypes = Boolean(packageJson.types || packageJson.typings);
  const pkgRemoveSideEffects = packageJson.removeSideEffects || false;






    const external = options.bundle ? ['@swc/*', '*.node'] : undefined */

  const result = await tsupExecutorFn(
    {
      ...options,
      getConfig: (_options: GetConfigParams) =>
        getTamaguiConfig({ ..._options, clientPlatform: "web" }),
      external: removeEmptyItems([
        "react",
        "react-dom",
        "react-native",
        ...(options.external ?? [])
      ])
    },
    context,
    config
  );
  if (!result.success) {
    return result;
  }

  /* const isESM = buildSettings.target === 'esm' || buildSettings.target === 'esnext'

  if (!built.outputFiles) {
    return
  }

  const nativeFilesMap = Object.fromEntries(
    built.outputFiles.flatMap((p) => {
      if (p.path.includes('.native.js')) {
        return [[p.path, true]]
      }
      return []
    })
  )

  await Promise.all(
    built.outputFiles.map(async (file) => {
      let outPath = file.path

      if (outPath.endsWith('.js') || outPath.endsWith('.js.map')) {
        const [_, extPlatform] =
          outPath.match(/(web|native|ios|android)\.js(\.map)?$/) ?? []

        if (options.clientPlatform === 'native') {
          if (!extPlatform && nativeFilesMap[outPath.replace('.js', '.native.js')]) {
            // if native exists, avoid outputting non-native
            return
          }

          if (extPlatform === 'web') {
            return
          }
          if (!extPlatform) {
            outPath = outPath.replace('.js', '.native.js')
          }
        }

        if (options.clientPlatform === 'web') {
          if (
            extPlatform === 'native' ||
            extPlatform === 'android' ||
            extPlatform === 'ios'
          ) {
            return
          }
        }
      }

      const outDir = dirname(outPath)

      await ensureDir(outDir)
      let outString = new TextDecoder().decode(file.contents)

      if (options.clientPlatform === 'web') {
        const rnWebReplacer = replaceReactNativeWeb[options.format]
        if (rnWebReplacer) {
          outString = outString.replaceAll(rnWebReplacer.from, rnWebReplacer.to)
        }
      }

      if (pkgRemoveSideEffects && isESM) {
        // match whitespace to preserve sourcemaps
        outString = outString.replace(/\nimport "[^"]+";\n/g, '\n\n')
      }

      async function flush(contents, path) {
        if (options.watch) {
          if (
            !(await pathExists(path)) ||
            (await readFile(path, 'utf8')) !== contents
          ) {
            await writeFile(path, contents)
          }
        } else {
          await writeFile(path, contents)
        }
      }

      await Promise.all([
        flush(outString, outPath),
        (async () => {
          if (isESM && mjs && outPath.endsWith('.js')) {
            const mjsOutPath = outPath.replace('.js', '.mjs')
            // if bundling no need to specify as its all internal
            // and babel is bad on huge bundled files
            const output = options.bundle
              ? outString
              : transform(outString, {
                  filename: mjsOutPath,
                  plugins: [
                    [
                      'babel-plugin-fully-specified',
                      {
                        ensureFileExists: false,
                        esExtensionDefault: '.mjs',
                        tryExtensions: ['.mjs', '.js'],
                        esExtensions: ['.mjs', '.js'],
                      },
                    ],
                  ],
                }).code
            // output to mjs fully specified
            await flush(output, mjsOutPath)
          }
        })(),
      ])
    })
  )*/

  return {
    success: true
  };
}

export const applyDefaultOptions = (
  options: Partial<TamaguiExecutorSchema>
): TamaguiExecutorSchema => {
  return {
    ...baseApplyDefaultOptions({
      entry: "{sourceRoot}/index.ts",
      plugins: [],
      getConfig: getTamaguiConfig,
      assets: [],
      ...options
    } as TsupExecutorSchema),
    transports: ["pino-pretty", "pino-loki"],
    clientPlatform: options?.clientPlatform ? options.clientPlatform : "both"
  } as TamaguiExecutorSchema;
};

export default withRunExecutor<TamaguiExecutorSchema>(
  "Storm-Stack Tamagui compiler",
  TamaguiExecutorFn,
  {
    skipReadingConfig: false,
    hooks: {
      applyDefaultOptions
    }
  }
);
