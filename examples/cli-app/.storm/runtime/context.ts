/* eslint-disable */
// biome-ignore lint: disable
// prettier-ignore

// Generated by Storm Stack
// Note: Do not edit this file manually - it will be overwritten automatically

import type {
StormContext,
} from "@storm-stack/types/node";
import { AsyncLocalStorage } from "node:async_hooks";
import { getContext } from "unctx";
import { StormError } from "./error";

const STORM_CONTEXT_KEY = "storm-stack";

export const STORM_ASYNC_CONTEXT = getContext<StormContext>(STORM_CONTEXT_KEY, {
  asyncContext: true,
  AsyncLocalStorage
});

/**
 * Get the Storm context for the current application.
 *
 * @returns The Storm context for the current application.
 * @throws If the Storm context is not available.
 */
export function useStorm(): StormContext {
  try {
    return STORM_ASYNC_CONTEXT.use();
  } catch {
    throw new StormError({ type: "general", code: 12 });
  }
}
