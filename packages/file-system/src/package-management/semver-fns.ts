/*-------------------------------------------------------------------

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

 -------------------------------------------------------------------*/

import { RELEASE_TYPES, type ReleaseType, inc, parse, valid } from "semver";

export const parseVersion = (semver: string) => parse(semver);

export const isRelativeVersionKeyword = (val: string): val is ReleaseType => {
  return RELEASE_TYPES.includes(val as ReleaseType);
};

export const deriveNewSemverVersion = (
  currentSemverVersion: string,
  semverSpecifier: string,
  preid?: string
) => {
  if (!valid(currentSemverVersion)) {
    throw new Error(
      `Invalid semver version "${currentSemverVersion}" provided.`
    );
  }

  let newVersion = semverSpecifier;
  if (isRelativeVersionKeyword(semverSpecifier)) {
    // Derive the new version from the current version combined with the new version specifier.
    const derivedVersion = inc(currentSemverVersion, semverSpecifier, preid);
    if (!derivedVersion) {
      throw new Error(
        `Unable to derive new version from current version "${currentSemverVersion}" and version specifier "${semverSpecifier}"`
      );
    }
    newVersion = derivedVersion;
  } else if (!valid(semverSpecifier)) {
    // Ensure the new version specifier is a valid semver version, given it is not a valid semver keyword
    throw new Error(
      `Invalid semver version specifier "${semverSpecifier}" provided. Please provide either a valid semver version or a valid semver version keyword.`
    );
  }

  return newVersion;
};
