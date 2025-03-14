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

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: $storm.env.SENTRY_DSN,
  environment: $storm.env.ENVIRONMENT,
  release: $storm.env.RELEASE_ID,
  debug: $storm.env.DEBUG,
  enabled: true,
  attachStacktrace: $storm.env.STACKTRACE,
  sendClientReports: true
});
