/**
 * The format for providing the application entry point(s) to the build command
 */
export type EntryPointsOption =
  | string
  | string[]
  | Record<string, string>
  | {
      in: string;
      out: string;
    }[];
