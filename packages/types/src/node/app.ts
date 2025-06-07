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

import type { IStormError } from "../shared/error.js";
import type { IStormPayload } from "../shared/payload.js";
import type { StormBaseVariables } from "../shared/vars.js";
import type { StormContext } from "./context.js";

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

export type SetupFunction = () => MaybePromise<
  IStormError | void | null | undefined
>;

export type ValidatorFunction<
  TPayload extends IStormPayload,
  TContext extends StormContext<StormBaseVariables, any, TPayload>
> = (context: TContext) => MaybePromise<IStormError | void | null | undefined>;

export type PreprocessFunction<
  TPayload extends IStormPayload,
  TContext extends StormContext<StormBaseVariables, any, TPayload>
> = (context: TContext) => MaybePromise<IStormError | void | null | undefined>;

export type HandlerFunction<TInput = any, TOutput = any> = (
  payload: IStormPayload<TInput>
) => MaybePromise<TOutput | IStormError>;

export type PostprocessFunction<
  TPayload extends IStormPayload,
  TContext extends StormContext<StormBaseVariables, any, TPayload>,
  TOutput
> = (
  context: TContext,
  output: TOutput
) => MaybePromise<IStormError | void | null | undefined>;

export type TeardownFunction = () => MaybePromise<
  IStormError | void | null | undefined
>;
