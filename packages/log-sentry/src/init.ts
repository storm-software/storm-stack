/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/projects/storm-stack/license.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://stormsoftware.com/projects/storm-stack/docs
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: $storm.env.SENTRY_DSN,
  environment: $storm.env.ENVIRONMENT,
  release: $storm.env.RELEASE_TAG,
  debug: !!$storm.env.DEBUG,
  enabled: true,
  attachStacktrace: !!$storm.env.STACKTRACE,
  sendClientReports: true
});
