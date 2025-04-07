
// Generated by @storm-software/untyped
// Do not edit this file directly

export interface StormStackCleanExecutorSchema {
 /**
  * Output Path
  * 
  * The output path for the build
  * 
  * @default "dist/{projectRoot}"
  * 
  * @format path
 */
 outputPath?: string,

 /**
  * Entry File
  * 
  * The entry file or files to build
  * 
  * @default "{sourceRoot}/index.ts"
  * 
  * @format path
 */
 entry?: string,

 /**
  * Presets
  * 
  * A list of presets to use during Storm Stack processing
  * 
 */
 presets?: Array<string>,

 /**
  * Plugins
  * 
  * A list of plugins to use during Storm Stack processing
  * 
 */
 plugins?: Array<string>,

 /**
  * Mode
  * 
  * The build mode
  * 
  * @default "production"
  * 
  * @enum development,staging,production
 */
 mode?: string,

 /**
  * TypeScript Configuration File
  * 
  * The path to the tsconfig file
  * 
  * @default "{projectRoot}/tsconfig.json"
  * 
  * @format path
 */
 tsconfig?: string,

 /**
  * Skip Installs
  * 
  * Skip installing dependencies during prepare stage
  * 
 */
 skipInstalls?: boolean,

 /**
  * Skip Cache
  * 
  * Skip the cache when building
  * 
 */
 skipCache?: boolean,

 /**
  * Skip Lint
  * 
  * Skip linting the project when building
  * 
 */
 skipLint?: boolean,

 /**
  * Silent
  * 
  * Should the build run silently - only report errors back to the user
  * 
  * @default false
 */
 silent?: boolean,
}

