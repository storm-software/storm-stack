/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { LogLevelLabel } from "@storm-software/config-tools/types";
import type { EngineHooks } from "../../../types/build";
import type { Context } from "../../../types/context";

/**
 * Prepares deployment configuration/infrastructure required by the Storm Stack project in CI/CD processes.
 *
 * @remarks
 * Some examples of potential artifacts that could be prepared by this step include (but are not limited to):
 * - Cloudflare Workers configuration files
 * - Kubernetes deployment manifests
 * - Docker Compose files for containerized applications
 * - Terraform scripts for infrastructure as code (IaC)
 * - Helm charts for Kubernetes applications
 * - Ansible playbooks for server configuration management
 * - CloudFormation templates for AWS infrastructure
 * - Pulumi scripts for cloud infrastructure provisioning
 * - Vagrant files for local development environments
 * - CI/CD pipeline configurations (e.g., GitHub Actions, GitLab CI, Jenkins
 *
 * @param context - The context containing options and environment paths.
 * @param hooks - The engine hooks to call during preparation.
 * @returns A promise that resolves when the preparation is complete.
 */
export async function prepareOutput(context: Context, hooks: EngineHooks) {
  context.log(
    LogLevelLabel.TRACE,
    `Initializing the output configuration for the Storm Stack project.`
  );

  await hooks.callHook("prepare:output", context).catch((error: Error) => {
    context.log(
      LogLevelLabel.ERROR,
      `An error occurred while initializing the deployment configuration for the Storm Stack project: ${error.message} \n${error.stack ?? ""}`
    );

    throw new Error(
      "An error occurred while initializing the deployment configuration for the Storm Stack project",
      { cause: error }
    );
  });
}
