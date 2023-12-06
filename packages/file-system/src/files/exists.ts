import { existsSync } from "node:fs";

/**
 * Check if a file exists
 *
 * @param filePath - The file path to check
 * @returns An indicator specifying if the file exists
 */
export const exists = (filePath: string): boolean => {
  return existsSync(filePath);
};
