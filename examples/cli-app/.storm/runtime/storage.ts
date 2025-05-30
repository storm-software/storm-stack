/* eslint-disable */
// biome-ignore lint: disable
// prettier-ignore

// Generated by Storm Stack
// Note: Do not edit this file manually - it will be overwritten automatically

import { createStorage } from "unstorage";
import storageFsCrashReportsStorage from "./storage/storage-fs-crash-reports";
import storageFsVarsStorage from "./storage/storage-fs-vars";

export const storage = createStorage();

storage.mount("crash-reports", storageFsCrashReportsStorage);
storage.mount("vars", storageFsVarsStorage);
