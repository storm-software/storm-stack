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

import type { ProjectConfiguration } from "@nx/devkit";
import type { ProjectTagVariant } from "@storm-software/workspace-tools/types";
import { addProjectTag } from "@storm-software/workspace-tools/utils/project-tags";
import { StormStackProjectTagVariant } from "../types";

/**
 * Add a project scope tag to the project.
 *
 * @param project - The project to add the tag to.
 * @param value - The value of the tag.
 * @param options - The options for the tag.
 */
export const addProjectScopeTag = (
  project: ProjectConfiguration,
  value: string,
  options?: {
    overwrite?: boolean;
  }
) => {
  addProjectTag(
    project,
    StormStackProjectTagVariant.SCOPE as ProjectTagVariant,
    value,
    {
      overwrite: options?.overwrite !== false
    }
  );
};
