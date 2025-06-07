import { Storage as Storage_2 } from 'unstorage';

export declare type __ΩCleanupFunction = any[];

export declare type __ΩDeserializerFunction = any[];

export declare type __ΩErrorMessageDetails = any[];

export declare type __ΩErrorType = any[];

export declare type __ΩFormattedValues = any[];

export declare type __ΩHandlerFunction = any[];

export declare type __ΩHelpMessageDetails = any[];

export declare type __ΩInfoMessageDetails = any[];

export declare type __ΩIStormError = any[];

export declare type __ΩIStormEvent = any[];

export declare type __ΩIStormLog = any[];

export declare type __ΩIStormPayload = any[];

export declare type __ΩIStormResult = any[];

export declare type __ΩLogCallback = any[];

export declare type __ΩLogFilter = any[];

export declare type __ΩLogFilterLike = any[];

export declare type __ΩLogLevel = any[];

export declare type __ΩLogRecord = any[];

export declare type __ΩLogSink = any[];

export declare type __ΩLogSinkInstance = any[];

export declare type __ΩLogTemplatePrefix = any[];

export declare type __ΩMessageDetails = any[];

export declare type __ΩMessageType = any[];

export declare type __ΩParsedStacktrace = any[];

export declare type __ΩPostprocessFunction = any[];

export declare type __ΩPreprocessFunction = any[];

export declare type __ΩSerializerFunction = any[];

export declare type __ΩSetupFunction = any[];

export declare type __ΩStormBaseVariables = any[];

export declare type __ΩStormBuildInfo = any[];

export declare type __ΩStormContext = any[];

export declare type __ΩStormEnvPaths = any[];

export declare type __ΩStormErrorOptions = any[];

export declare type __ΩStormRuntimeInfo = any[];

export declare type __ΩSuccessMessageDetails = any[];

export declare type __ΩValidationDetail = any[];

export declare type __ΩValidationDetailType = any[];

export declare type __ΩValidatorFunction = any[];

export declare type __ΩWarningMessageDetails = any[];

export declare type CleanupFunction = () => MaybePromise<IStormError | void | null | undefined>;

export declare type DeserializerFunction<TPayload extends IStormPayload, TInput = any> = (input: TInput) => MaybePromise<TPayload | IStormError>;

export declare type ErrorMessageDetails = MessageDetails<"error">;

/**
 * The type of error response message/event
 */
export declare type ErrorType = "general" | "not_found" | "validation" | "service_unavailable" | "action_unsupported" | "security" | "unknown";

/**
 * The formatted values for a log record.
 */
export declare interface FormattedValues {
    /**
     * The formatted timestamp.
     */
    timestamp: string;
    /**
     * The formatted log level.
     */
    level: string;
    /**
     * The formatted message.
     */
    message: string;
    /**
     * The unformatted log record.
     */
    record: LogRecord;
}

export declare type HandlerFunction<TInput = any, TOutput = any> = (payload: IStormPayload<TInput>) => MaybePromise<TOutput | IStormError>;

export declare type HelpMessageDetails = MessageDetails<"help">;

export declare type InfoMessageDetails = MessageDetails<"info">;

/**
 * A store that exists on the StormContext for internal use.
 *
 * @remarks
 * Please do not use this in application code as it is likely to change
 *
 * @internal
 */
declare interface Internal_StormContextStore {
    /**
     * List of events that have been emitted
     *
     * @internal
     */
    events: IStormEvent[];
}

/**
 * The Storm Error interface.
 */
export declare interface IStormError extends Error {
    /**
     * The error code
     */
    code: number;
    /**
     * The error message parameters
     */
    params: string[];
    /**
     * The type of error that was thrown.
     */
    type: ErrorType;
    /**
     * A url to display the error message
     */
    url: string;
    /**
     * Additional data to be passed with the error
     */
    data?: any;
    /**
     * The underlying cause of the error, if any. This is typically another error object that caused this error to be thrown.
     */
    cause: IStormError | undefined;
    /**
     * The error stack
     *
     * @remarks
     * This is overridden in `StormError` to be a parsed stacktrace
     */
    stack: string;
    /**
     * The parsed stacktrace
     */
    stacktrace: ParsedStacktrace[];
    /**
     * The original stacktrace
     */
    originalStack: string;
    /**
     * Returns a formatted error string that can be displayed to the user.
     */
    toDisplay: () => string;
    /**
     * Internal function to inherit the error
     *
     * @internal
     */
    __proto__: any;
}

export declare interface IStormEvent<TEventType extends string = string, TData = any> extends IStormPayload<TData> {
    /**
     * The unique identifier for the payload.
     */
    payloadId: string;
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
 * A logger interface. It provides methods to log messages at different severity levels.
 *
 * @remarks
 * The inspiration and much of the original implementation for this logger was taken from the [LogTape](https://logtape.org/) project. Major thanks to that project.
 *
 * ```typescript
 * $storm.log.debug(`A debug message with ${value}.`);
 * $storm.log.info(`An info message with ${value}.`);
 * $storm.log.warn(`A warning message with ${value}.`);
 * $storm.log.error(`An error message with ${value}.`);
 * $storm.log.fatal(`A fatal error message with ${value}.`);
 * ```
 */
export declare interface IStormLog {
    /**
     * Get a logger with contextual properties. This is useful for log multiple messages with the shared set of properties.
     *
     * ```typescript
     * const ctx = $storm.log.with({ foo: 123, bar: "abc" });
     * ctx.info("A message with {foo} and {bar}.");
     * ctx.warn("Another message with {foo}, {bar}, and {baz}.", { baz: true });
     * ```
     *
     * The above code is equivalent to:
     *
     * ```typescript
     * $storm.log.info("A message with {foo} and {bar}.", { foo: 123, bar: "abc" });
     * $storm.log.warn(
     *   "Another message with {foo}, {bar}, and {baz}.",
     *   { foo: 123, bar: "abc", baz: true },
     * );
     * ```
     *
     * @param properties - The properties to add to the logger.
     * @returns A logger with the specified properties.
     */
    with: (properties: Record<string, unknown>) => IStormLog;
    /**
     * Log a debug message. Use this as a template string prefix.
     *
     * ```typescript
     * $storm.log.debug(`A debug message with ${value}.`);
     * ```
     *
     * @param message - The message template strings array.
     * @param values - The message template values.
     */
    debug: ((message: TemplateStringsArray, ...values: readonly unknown[]) => void) & ((message: string, properties?: Record<string, unknown> | (() => Record<string, unknown>)) => void) & ((callback: LogCallback) => void);
    /**
     * Log an informational message. Use this as a template string prefix.
     *
     * ```typescript
     * $storm.log.info(`An info message with ${value}.`);
     * ```
     *
     * @param message - The message template strings array.
     * @param values - The message template values.
     */
    info: ((message: TemplateStringsArray, ...values: readonly unknown[]) => void) & ((message: string, properties?: Record<string, unknown> | (() => Record<string, unknown>)) => void) & ((callback: LogCallback) => void);
    /**
     * Log a warning message. Use this as a template string prefix.
     *
     * ```typescript
     * $storm.log.warn(`A warning message with ${value}.`);
     * ```
     *
     * @param message - The message template strings array.
     * @param values - The message template values.
     */
    warn: ((message: TemplateStringsArray, ...values: readonly unknown[]) => void) & ((message: string, properties?: Record<string, unknown> | (() => Record<string, unknown>)) => void) & ((callback: LogCallback) => void);
    /**
     * Log an error message. Use this as a template string prefix.
     *
     * ```typescript
     * $storm.log.error(`An error message with ${value}.`);
     * ```
     *
     * @param message - The message template strings array.
     * @param values - The message template values.
     */
    error: ((message: TemplateStringsArray | Error, ...values: readonly unknown[]) => void) & ((message: string, properties?: Record<string, unknown> | (() => Record<string, unknown>)) => void) & ((callback: LogCallback) => void);
    /**
     * Log a fatal error message. Use this as a template string prefix.
     *
     * ```typescript
     * $storm.log.fatal(`A fatal error message with ${value}.`);
     * ```
     *
     * @param message - The message template strings array.
     * @param values - The message template values.
     */
    fatal: ((message: TemplateStringsArray | Error, ...values: readonly unknown[]) => void) & ((message: string, properties?: Record<string, unknown> | (() => Record<string, unknown>)) => void) & ((callback: LogCallback) => void);
}

export declare interface IStormPayload<TData = any> {
    /**
     * The timestamp of the payload.
     */
    timestamp: number;
    /**
     * The unique identifier for the payload.
     */
    id: string;
    /**
     * The data of the payload.
     */
    data: TData;
}

/**
 * A Storm result interface. It represents the structure of a result returned by the Storm Stack runtime.
 *
 * @remarks
 * The `IStormResult` interface is used to standardize the structure of results returned by the Storm Stack runtime.
 * It includes properties for the request ID, data, error information, timestamp, and success status.
 */
export declare interface IStormResult<TData extends any | IStormError = any | IStormError> {
    /**
     * The unique identifier for the payload.
     */
    payloadId: string;
    /**
     * The result meta.
     */
    meta: Record<string, any>;
    /**
     * The data of the result.
     */
    data: TData;
    /**
     * The timestamp of the result.
     */
    timestamp: number;
    /**
     * An indicator of whether the result was successful.
     */
    success: boolean;
}

/**
 * A logging callback function.  It is used to defer the computation of a
 * message template until it is actually logged.
 * @param prefix - The message template prefix.
 * @returns The rendered message array.
 */
export declare type LogCallback = (prefix: LogTemplatePrefix) => unknown[];

/**
 * A filter is a function that accepts a log record and returns `true` if the
 * record should be passed to the sink.
 *
 * @param record - The log record to filter.
 * @returns `true` if the record should be passed to the sink.
 */
export declare type LogFilter = (record: LogRecord) => boolean;

/**
 * A filter-like value is either a {@link LogFilter} or a {@link LogLevel}.
 * `null` is also allowed to represent a filter that rejects all records.
 */
export declare type LogFilterLike = LogFilter | LogLevel | null;

/**
 * The severity level of a {@link LogRecord}.
 */
export declare type LogLevel = "debug" | "info" | "warning" | "error" | "fatal";

export declare const LogLevel: {
    DEBUG: LogLevel;
    INFO: LogLevel;
    WARNING: LogLevel;
    ERROR: LogLevel;
    FATAL: LogLevel;
};

/**
 * A log record.
 */
export declare interface LogRecord {
    /**
     * The log level.
     */
    readonly level: LogLevel;
    /**
     * The log message.  This is the result of substituting the message template
     * with the values.  The number of elements in this array is always odd,
     * with the message template values interleaved between the substitution
     * values.
     */
    readonly message: readonly unknown[];
    /**
     * The raw log message. This is the original message template without any further processing. It can be either:
     * - A string without any substitutions if the log record was created with a method call syntax, e.g., "Hello, \{name\}!" for logger.info("Hello, \{name\}!", \{ name \}).
     * - A template string array if the log record was created with a tagged template literal syntax, e.g., ["Hello, ", "!"] for logger.info\`Hello, $\{name\}!\`
     */
    readonly rawMessage: string | TemplateStringsArray;
    /**
     * The timestamp of the log record in milliseconds since the Unix epoch.
     */
    readonly timestamp: number;
    /**
     * The extra properties of the log record.
     */
    readonly properties: Record<string, unknown>;
}

/**
 * A sink is a function that accepts a log record and prints it somewhere.
 *
 * @param record - The log record to sink.
 */
export declare type LogSink = (record: LogRecord) => void;

export declare interface LogSinkInstance {
    /**
     * The log sink function.
     */
    handle: LogSink;
    /**
     * The lowest log level for the sink to accept.
     */
    logLevel: LogLevel;
}

/**
 * A logging template prefix function.  It is used to log a message in
 * a {@link LogCallback} function.
 * @param message - The message template strings array.
 * @param values - The message template values.
 * @returns The rendered message array.
 */
export declare type LogTemplatePrefix = (message: TemplateStringsArray, ...values: unknown[]) => unknown[];

declare type MaybePromise<T> = T | Promise<T>;

export declare type MessageDetails<TMessageType extends MessageType = MessageType> = {
    code: string;
    message?: string;
    type: TMessageType;
    params?: Record<string, any>;
} | {
    code?: string;
    message: string;
    type: TMessageType;
    params?: Record<string, any>;
};

export declare type MessageType = "help" | "error" | "warning" | "info" | "success";

export declare interface ParsedStacktrace {
    column?: number;
    function?: string;
    line?: number;
    source: string;
}

export declare type PostprocessFunction<TPayload extends IStormPayload, TContext extends StormContext<StormBaseVariables, any, TPayload>, TOutput> = (context: TContext, output: TOutput) => MaybePromise<IStormError | void | null | undefined>;

export declare type PreprocessFunction<TPayload extends IStormPayload, TContext extends StormContext<StormBaseVariables, any, TPayload>> = (context: TContext) => MaybePromise<IStormError | void | null | undefined>;

export declare type SerializerFunction<TResult extends IStormResult, TOutput = any> = (response: TResult | IStormResult<IStormError>) => MaybePromise<TOutput | IStormError>;

export declare type SetupFunction = () => MaybePromise<IStormError | void | null | undefined>;

/**
 * The base variables used by Storm Stack applications
 *
 * @remarks
 * This interface is used to define the environment variables, configuration options, and runtime settings used by the Storm Stack applications. It is used to provide type safety, autocompletion, and default values for the environment variables. The comments of each variable are used to provide documentation descriptions when running the \`storm docs\` command.
 *
 * @categoryDescription Platform
 * The name of the platform the variable is intended for use in.
 *
 * @showCategories
 */
export declare interface StormBaseVariables {
    /**
     * An indicator that specifies the application is running in the local Storm Stack development environment.
     *
     * @defaultValue false
     *
     * @internal
     * @category node
     * @readonly
     */
    STORM_STACK_LOCAL: boolean;
    /**
     * The name of the application.
     *
     * @category neutral
     */
    APP_NAME: string;
    /**
     * The version of the application.
     *
     * @defaultValue "1.0.0"
     *
     * @category neutral
     */
    APP_VERSION: string;
    /**
     * The unique identifier for the build.
     *
     * @category neutral
     */
    BUILD_ID: string;
    /**
     * The timestamp the build was ran at.
     *
     * @category neutral
     */
    BUILD_TIMESTAMP: number;
    /**
     * A checksum hash created during the build.
     *
     * @category neutral
     */
    BUILD_CHECKSUM: string;
    /**
     * The unique identifier for the release.
     *
     * @category neutral
     */
    RELEASE_ID: string;
    /**
     * The tag for the release. This is generally in the format of "\<APP_NAME\>\@\<APP_VERSION\>".
     *
     * @category neutral
     */
    RELEASE_TAG: string;
    /**
     * The name of the organization that maintains the application.
     *
     * @remarks
     * This variable is used to specify the name of the organization that maintains the application. If not provided in an environment, it will try to use the value in {@link @storm-software/config-tools/StormWorkspaceConfig#organization}.
     *
     * @category neutral
     */
    ORGANIZATION: string;
    /**
     * The platform for which the application was built.
     *
     * @defaultValue "node"
     *
     * @category neutral
     */
    PLATFORM: "node" | "browser";
    /**
     * The mode in which the application is running.
     *
     * @defaultValue "production"
     *
     * @category neutral
     */
    MODE: "development" | "staging" | "production";
    /**
     * The environment the application is running in. This value will be populated with the value of `MODE` if not provided.
     *
     * @defaultValue "production"
     *
     * @category neutral
     */
    ENVIRONMENT: string;
    /**
     * Indicates if the application is running in debug mode.
     *
     * @defaultValue false
     *
     * @category neutral
     */
    DEBUG: boolean;
    /**
     * An indicator that specifies the current runtime is a test environment.
     *
     * @defaultValue false
     *
     * @category neutral
     */
    TEST: boolean;
    /**
     * An indicator that specifies the current runtime is a minimal environment.
     *
     * @defaultValue false
     *
     * @category node
     */
    MINIMAL: boolean;
    /**
     * An indicator that specifies the current runtime is a no color environment.
     *
     * @defaultValue false
     *
     * @category node
     */
    NO_COLOR: boolean;
    /**
     * An indicator that specifies the current runtime is a force color environment.
     *
     * @defaultValue false
     *
     * @category node
     */
    FORCE_COLOR: boolean;
    /**
     * An indicator that specifies the current runtime should force hyperlinks in terminal output.
     *
     * @remarks
     * This variable is used to force hyperlinks in terminal output, even if the terminal does not support them. This is useful for debugging and development purposes.
     *
     * @defaultValue false
     *
     * @category node
     */
    FORCE_HYPERLINK: boolean;
    /**
     * The terminal type. This variable is set by certain CI/CD systems.
     *
     * @remarks
     * This variable is used to specify the terminal type that the application is running in. It can be used to determine how to format output for the terminal.
     *
     * @category node
     * @readonly
     */
    TERM?: string;
    /**
     * The terminal program name. This variable is set by certain terminal emulators.
     *
     * @category node
     * @readonly
     */
    TERM_PROGRAM: string;
    /**
     * The terminal program version. This variable is set by certain terminal emulators.
     *
     * @category node
     * @readonly
     */
    TERM_PROGRAM_VERSION: string;
    /**
     * The terminal emulator name. This variable is set by certain terminal emulators.
     *
     * @category node
     * @readonly
     */
    TERMINAL_EMULATOR?: string;
    /**
     * The terminal emulator session ID. This variable is set by certain terminal emulators.
     *
     * @category node
     * @readonly
     */
    WT_SESSION?: string;
    /**
     * An indicator that specifies the current terminal is running Terminus Sublime. This variable is set by certain terminal emulators.
     *
     * @category node
     * @readonly
     */
    TERMINUS_SUBLIME?: boolean;
    /**
     * The ConEmu task name. This variable is set by certain terminal emulators.
     *
     * @category node
     * @readonly
     */
    ConEmuTask?: string;
    /**
     * The cursor trace ID. This variable is set by certain terminal emulators.
     *
     * @category node
     * @readonly
     */
    CURSOR_TRACE_ID?: string;
    /**
     * The VTE version. This variable is set by certain terminal emulators.
     *
     * @category node
     * @readonly
     */
    VTE_VERSION?: string;
    /**
     * The environment the application is running in. This variable is a duplicate of `ENVIRONMENT` to support use in external packages.
     *
     * @defaultValue "production"
     *
     * @category neutral
     * @deprecated Use {@link ENVIRONMENT} instead.
     * @readonly
     */
    NODE_ENV: "development" | "staging" | "production";
    /**
     * Indicates if error stack traces should be captured.
     *
     * @defaultValue false
     *
     * @category neutral
     */
    STACKTRACE: boolean;
    /**
     * Indicates if error data should be included.
     *
     * @defaultValue false
     *
     * @category neutral
     */
    INCLUDE_ERROR_DATA: boolean;
    /**
     * A web page to lookup error messages and display additional information given an error code.
     *
     * @remarks
     * This variable is used to provide a URL to a page that can be used to look up error messages given an error code. This is used to provide a more user-friendly error message to the user.
     *
     * @title Error Details URL
     * @category neutral
     */
    ERROR_URL: string;
    /**
     * The default timezone for the application.
     *
     * @defaultValue "America/New_York"
     *
     * @category neutral
     */
    DEFAULT_TIMEZONE: string;
    /**
     * The default locale for the application.
     *
     * @defaultValue "en_US"
     *
     * @category neutral
     */
    DEFAULT_LOCALE: string;
    /**
     * The default lowest log level to accept. If `null`, the logger will reject all records. This value only applies if `lowestLogLevel` is not provided to the `logs` configuration.
     *
     * @defaultValue "info"
     *
     * @category neutral
     */
    LOG_LEVEL?: LogLevel | null;
    /**
     * An indicator that specifies the current runtime is a continuous integration environment.
     *
     * @remarks
     * This variable is used to replace the {@link CONTINUOUS_INTEGRATION} environment variable.
     *
     * @defaultValue false
     *
     * @title Continuous Integration
     * @category neutral
     */
    CI: boolean;
    /**
     * An indicator that specifies the current runtime is a continuous integration environment.
     *
     * @remarks
     * This variable is also set using the {@link CI} environment variable.
     *
     * @defaultValue false
     *
     * @category neutral
     * @deprecated Use {@link CI} instead.
     * @hidden
     */
    CONTINUOUS_INTEGRATION: boolean;
    /**
     * The unique identifier for the current run. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    RUN_ID?: string;
    /**
     * The agola git reference. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    AGOLA_GIT_REF?: string;
    /**
     * The appcircle build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    AC_APPCIRCLE?: string;
    /**
     * The appveyor build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    APPVEYOR?: string;
    /**
     * The codebuild build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    CODEBUILD?: string;
    /**
     * The task force build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    TF_BUILD?: string;
    /**
     * The bamboo plan key. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    bamboo_planKey?: string;
    /**
     * The bitbucket commit. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    BITBUCKET_COMMIT?: string;
    /**
     * The bitrise build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    BITRISE_IO?: string;
    /**
     * The buddy workspace ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    BUDDY_WORKSPACE_ID?: string;
    /**
     * The buildkite build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    BUILDKITE?: string;
    /**
     * The circleci build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    CIRCLECI?: string;
    /**
     * The cirrus-ci build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    CIRRUS_CI?: string;
    /**
     * The cf build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    CF_BUILD_ID?: string;
    /**
     * The cm build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    CM_BUILD_ID?: string;
    /**
     * The ci name. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    CI_NAME?: string;
    /**
     * The drone build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    DRONE?: string;
    /**
     * The dsari build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    DSARI?: string;
    /**
     * The earthly build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    EARTHLY_CI?: string;
    /**
     * The eas build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    EAS_BUILD?: string;
    /**
     * The gerrit project. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    GERRIT_PROJECT?: string;
    /**
     * The gitea actions build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    GITEA_ACTIONS?: string;
    /**
     * The github actions build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    GITHUB_ACTIONS?: string;
    /**
     * The gitlab ci build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    GITLAB_CI?: string;
    /**
     * The go cd build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    GOCD?: string;
    /**
     * The builder output build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    BUILDER_OUTPUT?: string;
    /**
     * The harness build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    HARNESS_BUILD_ID?: string;
    /**
     * The jenkins url. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    JENKINS_URL?: string;
    /**
     * The layerci build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    LAYERCI?: string;
    /**
     * The magnum build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    MAGNUM?: string;
    /**
     * The netlify build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    NETLIFY?: string;
    /**
     * The nevercode build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    NEVERCODE?: string;
    /**
     * The prow job ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    PROW_JOB_ID?: string;
    /**
     * The release build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    RELEASE_BUILD_ID?: string;
    /**
     * The render build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    RENDER?: string;
    /**
     * The sailci build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    SAILCI?: string;
    /**
     * The hudson build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    HUDSON?: string;
    /**
     * The screwdriver build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    SCREWDRIVER?: string;
    /**
     * The semaphore build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    SEMAPHORE?: string;
    /**
     * The sourcehut build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    SOURCEHUT?: string;
    /**
     * The strider build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    STRIDER?: string;
    /**
     * The task ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    TASK_ID?: string;
    /**
     * The teamcity version. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    TEAMCITY_VERSION?: string;
    /**
     * The travis build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    TRAVIS?: string;
    /**
     * The vela build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    VELA?: string;
    /**
     * The now builder build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    NOW_BUILDER?: string;
    /**
     * The appcenter build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    APPCENTER_BUILD_ID?: string;
    /**
     * The xcode project build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    CI_XCODE_PROJECT?: string;
    /**
     * The xcode server build ID. This value is set by certain CI/CD systems.
     *
     * @category node
     * @readonly
     */
    XCS?: string;
    /**
     * The Vercel environment. This variable is set by Vercel when the application is running in a Vercel environment.
     *
     * @category node
     * @deprecated Use {@link ENVIRONMENT} instead.
     * @readonly
     */
    VERCEL_ENV?: string;
    /**
     * The Storm Stack application's runtime data directory.
     *
     * @remarks
     * This variable is used to override the base path of the system's local application data directory. This variable is used to set the \`$storm.paths.data\` property.
     *
     * @title Data Directory
     * @category node
     */
    DATA_DIR?: string;
    /**
     * The Storm Stack application's configuration data directory.
     *
     * @remarks
     * This variable is used to override the base path of the system's local application configuration directory. This variable is used to set the \`$storm.paths.config\` property.
     *
     * @title Configuration Directory
     * @category node
     */
    CONFIG_DIR?: string;
    /**
     * The Storm Stack application's cached data directory.
     *
     * @remarks
     * This variable is used to override the base path of the system's local cache data directory. This variable is used to set the \`$storm.paths.cache\` property.
     *
     * @title Cache Directory
     * @category node
     */
    CACHE_DIR?: string;
    /**
     * The Storm Stack application's logging directory.
     *
     * @remarks
     * This variable is used to override the base path of the system's local application log directory. This variable is used to set the \`$storm.paths.log\` property.
     *
     * @title Log Directory
     * @category node
     */
    LOG_DIR?: string;
    /**
     * The Storm Stack application's temporary data directory.
     *
     * @remarks
     * This variable is used to override the base path of the system's local temporary data directory. This variable is used to set the \`$storm.paths.temp\` property.
     *
     * @title Temporary Directory
     * @category node
     */
    TEMP_DIR?: string;
    /**
     * A variable that specifies the current user's local application data directory on Windows.
     *
     * @see https://www.advancedinstaller.com/appdata-localappdata-programdata.html
     *
     * @remarks
     * This variable is used to specify a path to application data that is specific to the current user. This variable can be used to set the \`$storm.paths.data\`, \`$storm.paths.cache\`, and \`$storm.paths.log\` properties.
     *
     * @category node
     * @readonly
     */
    LOCALAPPDATA?: string;
    /**
     * A variable that specifies the application data directory on Windows.
     *
     * @see https://www.advancedinstaller.com/appdata-localappdata-programdata.html
     *
     * @remarks
     * This variable is used to specify a path to application data that is specific to the current user. This variable can be used to set the \`$storm.paths.config\` property.
     *
     * @category node
     * @readonly
     */
    APPDATA?: string;
    /**
     * A variable that specifies the data path in the home directory on Linux systems using the XDG base directory specification.
     *
     * @see https://gist.github.com/roalcantara/107ba66dfa3b9d023ac9329e639bc58c
     *
     * @remarks
     * This variable is used to specify a path to application data that is specific to the current user. This variable can be used to set the \`$storm.paths.data\` property.
     *
     * @category node
     * @readonly
     */
    XDG_DATA_HOME?: string;
    /**
     * A variable that specifies the configuration path in the home directory on Linux systems using the XDG base directory specification.
     *
     * @see https://gist.github.com/roalcantara/107ba66dfa3b9d023ac9329e639bc58c
     *
     * @remarks
     * This variable is used to specify a path to configuration data that is specific to the current user. This variable can be used to set the \`$storm.paths.config\` property.
     *
     * @category node
     * @readonly
     */
    XDG_CONFIG_HOME?: string;
    /**
     * A variable that specifies the cache path in the home directory on Linux systems using the XDG base directory specification.
     *
     * @see https://gist.github.com/roalcantara/107ba66dfa3b9d023ac9329e639bc58c
     *
     * @remarks
     * This variable is used to specify a path to cache data that is specific to the current user. This variable can be used to set the \`$storm.paths.cache\` property.
     *
     * @category node
     * @readonly
     */
    XDG_CACHE_HOME?: string;
    /**
     * A variable that specifies the state directory on Linux systems using the XDG base directory specification.
     *
     * @see https://gist.github.com/roalcantara/107ba66dfa3b9d023ac9329e639bc58c
     *
     * @remarks
     * This variable is used to specify a path to application state data that is specific to the current user. This variable can be used to set the \`$storm.paths.state\` property.
     *
     * @category node
     * @readonly
     */
    XDG_STATE_HOME?: string;
    /**
     * A variable that specifies the runtime directory on Linux systems using the XDG base directory specification.
     *
     * @see https://gist.github.com/roalcantara/107ba66dfa3b9d023ac9329e639bc58c
     *
     * @remarks
     * This variable is used to specify a path to runtime data that is specific to the current user. This variable can be used to set the \`$storm.paths.temp\` property.
     *
     * @category node
     * @readonly
     */
    XDG_RUNTIME_DIR?: string;
    /**
     * A variable that specifies the [Devenv](https://devenv.sh/) runtime directory.
     *
     * @see https://devenv.sh/files-and-variables/#devenv_dotfile
     * @see https://nixos.org/
     *
     * @remarks
     * This variable is used to specify a path to application data that is specific to the current [Nix](https://nixos.org/) environment. This variable can be used to set the \`$storm.paths.temp\` property.
     *
     * @category node
     */
    DEVENV_RUNTIME?: string;
}

/**
 * Interface representing the static build information for the Storm application.
 */
export declare interface StormBuildInfo {
    /**
     * The package name of the application.
     */
    packageName: string;
    /**
     * The version of the application.
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
     * The tag associated with the release.
     *
     * @remarks
     * This is in the format of "\<APP_NAME\>\@\<APP_VERSION\>".
     */
    releaseTag: string;
    /**
     * The name of the organization that maintains the application.
     */
    organization: string;
    /**
     * The mode in which the application is running (e.g., 'development', 'staging', 'production').
     */
    mode: "development" | "staging" | "production";
    /**
     * The platform for which the application was built.
     */
    platform: "node" | "browser" | "neutral";
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

/**
 * The global Storm Stack application context. This object contains information related to the current process's execution.
 *
 * @remarks
 * The Storm Stack application context object is injected into the global scope of the application. It can be accessed using `$storm` or `useStorm()` in the application code.
 */
export declare type StormContext<TVars extends StormBaseVariables = StormBaseVariables, TAdditionalFields extends Record<string, any> = Record<string, any>, TPayload extends IStormPayload = IStormPayload> = TAdditionalFields & {
    /**
     * The name of the Storm application.
     */
    readonly name: string;
    /**
     * The version of the Storm application.
     */
    readonly version: string;
    /**
     * The variables for the Storm application.
     */
    readonly vars: TVars;
    /**
     * The runtime information for the Storm application.
     */
    readonly runtime: StormRuntimeInfo;
    /**
     * The build information for the Storm application.
     */
    readonly build: StormBuildInfo;
    /**
     * The environment paths for storing things like data, config, logs, and cache in the current runtime environment.
     *
     * @remarks
     * On macOS, directories are generally created in \`~/Library/Application Support/<name>\`.
     * On Windows, directories are generally created in \`%AppData%/<name>\`.
     * On Linux, directories are generally created in \`~/.config/<name>\` - this is determined via the [XDG Base Directory spec](https://specifications.freedesktop.org/basedir-spec/latest/).
     *
     * If the \`STORM_DATA_DIR\`, \`STORM_CONFIG_DIR\`, \`STORM_CACHE_DIR\`, \`STORM_LOG_DIR\`, or \`STORM_TEMP_DIR\` environment variables are set, they will be used instead of the default paths.
     */
    readonly paths: StormEnvPaths;
    /**
     * The current payload object for the Storm application.
     */
    readonly payload: TPayload;
    /**
     * The current meta object.
     */
    readonly meta: Record<string, any>;
    /**
     * The root application logger for the Storm Stack application.
     */
    readonly log: IStormLog;
    /**
     * The root [unstorage](https://unstorage.unjs.io/) storage to use for Storm Stack application.
     */
    readonly storage: Storage_2;
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

/**
 * The environment paths for storing things like data, config, logs, and cache in the current runtime environment.
 *
 * @remarks
 * On macOS, directories are generally created in \`~/Library/Application Support/<name>\`.
 * On Windows, directories are generally created in \`%AppData%/<name>\`.
 * On Linux, directories are generally created in \`~/.config/<name>\` - this is determined via the [XDG Base Directory spec](https://specifications.freedesktop.org/basedir-spec/latest/).
 *
 * If the \`STORM_DATA_DIR\`, \`STORM_CONFIG_DIR\`, \`STORM_CACHE_DIR\`, \`STORM_LOG_DIR\`, or \`STORM_TEMP_DIR\` environment variables are set, they will be used instead of the default paths.
 */
export declare interface StormEnvPaths {
    data: string;
    config: string;
    cache: string;
    log: string;
    temp: string;
}

/**
 * Interface representing the Storm error options.
 */
export declare interface StormErrorOptions {
    /**
     * The error name.
     */
    name?: string;
    /**
     * The error code
     */
    code: number;
    /**
     * The error message parameters.
     */
    params?: string[];
    /**
     * The error cause.
     */
    cause?: unknown;
    /**
     * The error stack.
     */
    stack?: string;
    /**
     * The type of error.
     *
     * @defaultValue "exception"
     */
    type?: ErrorType;
    /**
     * Additional data to be included with the error.
     */
    data?: any;
}

/**
 * Interface representing the dynamic runtime information for the Storm application.
 */
export declare interface StormRuntimeInfo {
    /**
     * Indicates if the application is running in debug mode.
     */
    isDebug: boolean;
    /**
     * Indicates if the application is running in a test environment.
     */
    isTest: boolean;
    /**
     * Indicates if the application is running on Node.js.
     */
    isNode: boolean;
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
     * Checks `stdin` for our prompts - It checks that the stream is TTY, not a dumb terminal
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
     * Indicates if Unicode characters are supported in the terminal.
     */
    isUnicodeSupported: boolean;
    /**
     * Indicates if color output is supported in the terminal.
     */
    isColorSupported: boolean;
    /**
     * Indicates if the application is running in a server environment.
     */
    isServer: boolean;
}

export declare type SuccessMessageDetails = MessageDetails<"success">;

export declare type ValidationDetail = {
    code: string;
    message?: string;
    type: ValidationDetailType;
    params?: Record<string, any>;
} | {
    code?: string;
    message: string;
    type: ValidationDetailType;
    params?: Record<string, any>;
};

export declare type ValidationDetailType = "help" | "error" | "warning" | "info" | "success";

export declare type ValidatorFunction<TPayload extends IStormPayload, TContext extends StormContext<StormBaseVariables, any, TPayload>> = (context: TContext) => MaybePromise<IStormError | void | null | undefined>;

export declare type WarningMessageDetails = MessageDetails<"warning">;

export { }
