declare module "semver" {
  export type ReleaseType =
    | "major"
    | "premajor"
    | "minor"
    | "preminor"
    | "patch"
    | "prepatch"
    | "prerelease";

  export const RELEASE_TYPES: ReleaseType[];

  export interface Options {
    loose?: boolean | undefined;
  }

  export interface SemVer {
    major: number;
    minor: number;
    patch: number;
    version: string;
    build: readonly string[];
    prerelease: ReadonlyArray<string | number>;
  }

  export function parse(
    version: string | SemVer | null | undefined,
    optionsOrLoose?: boolean | Options
  ): SemVer | null;

  export function valid(
    version: string | SemVer | null | undefined,
    optionsOrLoose?: boolean | Options
  ): string | null;

  export const parseVersion: (semver: string) => ReturnType<typeof parse>;

  export const isRelativeVersionKeyword: (val: string) => val is ReleaseType;

  export const deriveNewSemverVersion: (
    currentSemverVersion: string,
    semverSpecifier: string,
    preid?: string
  ) => string;
}
