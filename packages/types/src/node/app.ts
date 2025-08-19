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

import type { StormErrorInterface } from "../shared/error.js";
import type { StormRequestInterface } from "./request.js";

export type ValidationDetailType =
  | "help"
  | "error"
  | "warning"
  | "info"
  | "success";
export type ValidationDetail =
  | {
      code: string;
      message?: string;
      type: ValidationDetailType;
      params?: Record<string, any>;
    }
  | {
      code?: string;
      message: string;
      type: ValidationDetailType;
      params?: Record<string, any>;
    };

type MaybePromise<T> = T | Promise<T>;

// export type SetupFunction = () => MaybePromise<
//   StormErrorInterface | void | null | undefined
// >;

// export type ValidatorFunction<
//   TPayload extends StormPayloadInterface,
//   TContext extends StormContext
// > = (
//   context: TContext
// ) => MaybePromise<StormErrorInterface | void | null | undefined>;

// export type PreprocessFunction<
//   TPayload extends StormPayloadInterface,
//   TContext extends StormContext
// > = (
//   context: TContext
// ) => MaybePromise<StormErrorInterface | void | null | undefined>;

export type HandlerFunction<
  TInput extends Record<string, any> = Record<string, any>,
  TOutput = any
> = (
  request: StormRequestInterface<TInput>
) => MaybePromise<TOutput | StormErrorInterface>;

// export type PostprocessFunction<
//   TPayload extends StormPayloadInterface,
//   TContext extends StormContext,
//   TOutput
// > = (
//   context: TContext,
//   output: TOutput
// ) => MaybePromise<StormErrorInterface | void | null | undefined>;

// export type TeardownFunction = () => MaybePromise<
//   StormErrorInterface | void | null | undefined
// >;
