/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

import type { ServePayload } from "../types";

/**
 * Start a server and serve the application
 *
 * @param event - The event object containing the payload
 */
function handler(event: StormRequest<ServePayload>) {
  const payload = event.data;

  $storm.log.info(
    `Starting server on ${payload.host}:${payload.port} with compress: ${payload.compress} and loadEnv: ${payload.loadEnv}`
  );
}

export default handler;

// const dev = defineCommand({
//   meta: {
//     name: 'dev',
//     version: version,
//     description: 'Start the dev server',
//   },
//   args: {
//     clean: {
//       type: 'boolean',
//     },
//     host: {
//       type: 'string',
//     },
//     port: {
//       type: 'string',
//     },
//     https: {
//       type: 'boolean',
//     },
//     mode: {
//       type: 'string',
//       description:
//         'If set to "production" you can run the development server but serve the production bundle',
//     },
//     'debug-bundle': {
//       type: 'string',
//       description: `Will output the bundle to a temp file and then serve it from there afterwards allowing you to easily edit the bundle to debug problems.`,
//     },
//     debug: {
//       type: 'string',
//       description: `Pass debug args to Vite`,
//     },
//   },
//   async run({ args }) {
//     const { dev } = await import('./cli/dev')
//     await dev({
//       ...args,
//       debugBundle: args['debug-bundle'],
//       mode: modes[args.mode],
//     })
//   },
// })
