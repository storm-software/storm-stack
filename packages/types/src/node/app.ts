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

import type { StormEnv } from "../shared/env.js";
import type { IStormError } from "../shared/error.js";
import type { IStormRequest } from "../shared/request.js";
import type { IStormResponse } from "../shared/response.js";
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

export type DeserializerFunction<
  TRequest extends IStormRequest,
  TPayload = any
> = (payload: TPayload) => MaybePromise<TRequest | IStormError>;

export type ValidatorFunction<
  TRequest extends IStormRequest,
  TContext extends StormContext<StormEnv, any, TRequest>
> = (context: TContext) => MaybePromise<IStormError | void | null | undefined>;

export type PreprocessFunction<
  TRequest extends IStormRequest,
  TContext extends StormContext<StormEnv, any, TRequest>
> = (context: TContext) => MaybePromise<IStormError | void | null | undefined>;

export type HandlerFunction<
  TRequest extends IStormRequest,
  TResponse extends IStormResponse
> = (request: TRequest) => MaybePromise<TResponse["data"] | IStormError>;

export type PostprocessFunction<
  TRequest extends IStormRequest,
  TContext extends StormContext<StormEnv, any, TRequest>,
  TResult
> = (
  context: TContext,
  result: TResult
) => MaybePromise<IStormError | void | null | undefined>;

export type SerializerFunction<
  TResponse extends IStormResponse,
  TResult = any
> = (
  response: TResponse | IStormResponse<IStormError>
) => MaybePromise<TResult | IStormError>;

export type CleanupFunction = () => MaybePromise<
  IStormError | void | null | undefined
>;
