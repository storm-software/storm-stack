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

import type {
  IStormError,
  IStormLog,
  IStormRequest,
  IStormResponse,
  LogSinkInstance,
  StormEnv
} from "@storm-stack/types";
import type { ProviderInfo } from "@stryke/env/providers";
import type { RuntimeInfo } from "@stryke/env/runtime-checks";
import type { MaybePromise } from "@stryke/types/base";
import type { ValidationDetail as ExternalValidationDetail } from "@stryke/types/validations";
import type { Storage } from "unstorage";

/**
 * Interface representing the runtime information for the Storm application.
 */
export interface StormRuntimeInfo extends Partial<RuntimeInfo> {
  /**
   * Indicates if the application is running on Node.js.
   */
  isNode: boolean;

  /**
   * Indicates if the application is running on Bun.
   */
  isBun: boolean;

  /**
   * Indicates if the application is running on Deno.
   */
  isDeno: boolean;

  /**
   * Indicates if the application is running on Fastly.
   */
  isFastly: boolean;

  /**
   * Indicates if the application is running on Netlify.
   */
  isNetlify: boolean;

  /**
   * Indicates if the application is running on EdgeLight.
   */
  isEdgeLight: boolean;

  /**
   * Indicates if the application is running on Workerd.
   */
  isWorkerd: boolean;

  /**
   * Indicates if the application is running on a Windows operating system.
   */
  isWindows: boolean;

  /**
   * Indicates if the application is running on a Linux operating system.
   */
  isLinux: boolean;

  /**
   * Indicates if the application is running on a macOS operating system.
   */
  isMacOS: boolean;

  /**
   * Indicates if the application is running in a Continuous Integration (CI) environment.
   */
  isCI: boolean;

  /**
   * Indicates if the current process is interactive
   *
   * @see https://github.com/sindresorhus/is-interactive/blob/dc8037ae1a61d828cfb42761c345404055b1e036/index.js
   *
   * @remarks
   * Defaults to check `stdin` for our prompts - It checks that the stream is TTY, not a dumb terminal
   */
  isInteractive: boolean;

  /**
   * Indicates if the application has a TTY (teletypewriter) interface.
   */
  hasTTY: boolean;

  /**
   * Indicates if the application is running in a minimal environment.
   */
  isMinimal: boolean;

  /**
   * Indicates if color output is supported in the terminal.
   */
  isColorSupported: boolean;

  /**
   * Indicates if the application is running in a server environment.
   */
  isServer: boolean;

  /**
   * The version of Node.js that the application is using, or null if not applicable.
   */
  nodeVersion: string | null;

  /**
   * The major version of Node.js that the application is using, or null if not applicable.
   */
  nodeMajorVersion: number | null;

  /**
   * The provider information for the application.
   */
  provider: ProviderInfo;
}

/**
 * Interface representing the build information for the Storm application.
 */
export interface StormBuildInfo {
  /**
   * The name of the application.
   *
   * @remarks
   * This is the name of the application as defined in env.APP_NAME or package.json file.
   */
  name: string;

  /**
   * The version of the application.
   *
   * @remarks
   * This is the version of the application as defined in env.APP_VERSION or package.json file.
   */
  version: string;

  /**
   * The unique identifier for the build.
   */
  buildId: string;

  /**
   * The timestamp for the build.
   */
  timestamp: number;

  /**
   * The unique identifier for the release.
   */
  releaseId: string;

  /**
   * The mode in which the application is running (e.g., 'development', 'staging', 'production').
   */
  mode: "development" | "staging" | "production";

  /**
   * The platform for which the application was built.
   */
  platform: "node" | "browser" | "worker";

  /**
   * Indicates if the application is running in debug mode.
   */
  isDebug: boolean;

  /**
   * Indicates if the application is running in a test environment.
   */
  isTest: boolean;

  /**
   * Indicates if the application is running in a production environment.
   */
  isProduction: boolean;

  /**
   * Indicates if the application is running in a staging environment.
   */
  isStaging: boolean;

  /**
   * Indicates if the application is running in a development environment.
   */
  isDevelopment: boolean;
}

export interface IStormEvent<TEventType extends string = string, TData = any>
  extends IStormRequest<TData> {
  /**
   * The unique identifier for the request.
   */
  requestId: string;

  /**
   * The type of the event.
   */
  type: TEventType;

  /**
   * The version of the event.
   */
  version: string;

  /**
   * The event label.
   *
   * @remarks
   * The label format is "\{type\}-v\{version\}"
   */
  label: string;
}

/**
 * A store that exists on the StormContext for internal use.
 *
 * @remarks
 * Please do not use this in application code as it is likely to change
 *
 * @internal
 */
interface Internal_StormContextStore {
  /**
   * List of events that have been emitted
   *
   * @internal
   */
  events: IStormEvent[];
}

export interface StormRuntimeParams {
  name?: string;
  storage?: Storage;
  log: LogSinkInstance | LogSinkInstance[];
}

/**
 * Interface representing the global Storm Application context.
 *
 * @remarks
 * This object is injected into the global scope of the Storm Stack application. It can be accessed using the `storm` variable.
 */
export type StormContext<
  TEnv extends StormEnv = StormEnv,
  TAdditionalFields extends Record<string, any> = Record<string, any>,
  TRequest extends IStormRequest = IStormRequest
> = TAdditionalFields & {
  /**
   * The name of the Storm application.
   */
  readonly name: string;

  /**
   * The version of the Storm application.
   */
  readonly version: string;

  /**
   * The environment variables for the Storm application.
   */
  readonly env: TEnv;

  /**
   * The runtime information for the Storm application.
   */
  readonly runtime: StormRuntimeInfo;

  /**
   * The build information for the Storm application.
   */
  readonly build: StormBuildInfo;

  /**
   * The current request object for the Storm application.
   */
  readonly request: TRequest;

  /**
   * The current meta object to use in the response.
   */
  readonly meta: Record<string, any>;

  /**
   * The root application logger for the Storm Stack application.
   */
  readonly log: IStormLog;

  /**
   * The root [unstorage](https://unstorage.unjs.io/) storage to use for Storm Stack application.
   */
  readonly storage: Storage;

  /**
   * A function to emit an event to a processing queue.
   */
  emit: <TEvent extends IStormEvent<string, any>>(event: TEvent) => void;

  /**
   * A store that exists on the StormContext for internal use.
   *
   * @remarks
   * Please do not use this in application code as it is likely to change
   *
   * @internal
   */
  __internal: Internal_StormContextStore;
};

export type ValidationDetail = ExternalValidationDetail;

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

/**
 * Interface representing the attachments for a Storm application builder.
 *
 * @remarks
 * This interface defines the structure for the attachments that can be used to
 * customize the behavior of the Storm application builder.
 */
export interface BuilderConfig<
  TRequest extends IStormRequest,
  TResponse extends IStormResponse,
  TPayload = any,
  TResult = any,
  TContext extends StormContext<StormEnv, any, TRequest> = StormContext<
    StormEnv,
    any,
    TRequest
  >
> {
  setup?: SetupFunction;
  deserializer?: DeserializerFunction<TRequest, TPayload>;
  validator?: ValidatorFunction<TRequest, TContext>;
  preprocess?: PreprocessFunction<TRequest, TContext>;
  handler?: HandlerFunction<TRequest, TResponse>;
  postprocess?: PostprocessFunction<TRequest, TContext, TResult>;
  serializer?: SerializerFunction<TResponse, TResult>;
  cleanup?: CleanupFunction;
}

export interface BuilderResult<
  TRequest extends IStormRequest,
  TResponse extends IStormResponse,
  TPayload = any,
  TResult = any,
  TContext extends StormContext<StormEnv, any, TRequest> = StormContext<
    StormEnv,
    any,
    TRequest
  >
> {
  setup: () => Omit<
    BuilderResult<TRequest, TResponse, TPayload, TResult>,
    "setup"
  >;
  deserializer: (
    deserializerFn: DeserializerFunction<TRequest, TPayload>
  ) => Omit<
    BuilderResult<TRequest, TResponse, TPayload, TResult>,
    "deserializer"
  >;
  validator: (
    validatorFn: ValidatorFunction<TRequest, TContext>
  ) => Omit<BuilderResult<TRequest, TResponse, TPayload, TResult>, "validator">;
  preprocess: (
    preprocessFn: PreprocessFunction<TRequest, TContext>
  ) => Omit<
    BuilderResult<TRequest, TResponse, TPayload, TResult>,
    "preprocess"
  >;
  handler: (
    handlerFn: HandlerFunction<TRequest, TResponse>
  ) => Omit<BuilderResult<TRequest, TResponse, TPayload, TResult>, "handler">;
  postprocess: (
    postprocessFn: PostprocessFunction<TRequest, TContext, TResult>
  ) => Omit<
    BuilderResult<TRequest, TResponse, TPayload, TResult>,
    "postprocess"
  >;
  serializer: (
    serializerFn: SerializerFunction<TResponse, TResult>
  ) => Omit<
    BuilderResult<TRequest, TResponse, TPayload, TResult>,
    "serializer"
  >;
  cleanup: () => Omit<
    BuilderResult<TRequest, TResponse, TPayload, TResult>,
    "cleanup"
  >;
  build: () => (payload: TPayload) => Promise<TResult>;
}
