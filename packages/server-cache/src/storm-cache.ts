/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

import type { StormConfig } from "@storm-software/config";
import { joinPaths } from "@storm-stack/file-system/files/join-paths";
import { StormTrace } from "@storm-stack/telemetry/storm-trace";
import { BentoCache, bentostore } from "bentocache";
import { fileDriver } from "bentocache/drivers/file";
import { memoryDriver } from "bentocache/drivers/memory";
import type {
  BentoCachePlugin,
  CacheProvider,
  Factory,
  GetOptions,
  GetOrSetOptions,
  HasOptions,
  RawBentoCacheOptions
} from "bentocache/types";
import { isAbsolute } from "node:path";
import { notificationBusDriver } from "./notification-bus";

export type StormCacheOptions = Partial<
  RawBentoCacheOptions & {
    stores: Record<string, ReturnType<typeof bentostore>>;
    plugins?: BentoCachePlugin[];
    default: keyof Record<string, ReturnType<typeof bentostore>>;
  }
>;

export class StormCache {
  public static create(
    config: StormConfig,
    trace?: StormTrace,
    options: StormCacheOptions = {}
  ) {
    const _trace = trace ?? StormTrace.create(config, "storm-cache");

    const cache = new StormCache(config, _trace, options);
    _trace.debug("StormCache initialization has completed successfully...");

    return cache;
  }

  protected trace: StormTrace;

  #config: StormConfig;

  #cacheManager: BentoCache<Record<string, ReturnType<typeof bentostore>>>;

  #configCache: CacheProvider;

  private constructor(
    config: StormConfig,
    trace: StormTrace,
    options: StormCacheOptions
  ) {
    this.#config = config;
    this.trace = trace ?? StormTrace.create(this.#config, "storm-cache");

    this.#cacheManager = this.createCacheManager(options);

    this.#configCache = this.#cacheManager.namespace("config");
    this.#configCache.setForever("config", this.#config);
  }

  public get cache(): BentoCache<
    Record<string, ReturnType<typeof bentostore>>
  > {
    return this.#cacheManager;
  }

  public get originalConfig(): StormConfig {
    return this.#config;
  }

  public get configCache(): CacheProvider {
    return this.#configCache;
  }

  public getOrSet<T>(
    key: string,
    factory: Factory<T>,
    options?: GetOrSetOptions | undefined
  ): Promise<T> {
    return this.#cacheManager.getOrSet<T>(key, factory, options);
  }

  public get<T>(
    key: string,
    defaultValue?: Factory<T> | undefined,
    options?: GetOptions | undefined
  ): Promise<T> {
    return this.#cacheManager.get<T>(key, defaultValue, options);
  }

  public set(key: string, value: any, options?: GetOrSetOptions | undefined) {
    return this.#cacheManager.set(key, value, options);
  }

  public has(key: string, options?: HasOptions | undefined): Promise<boolean> {
    return this.#cacheManager.has(key, options);
  }

  public getOrSetConfig<T>(
    key: string,
    factory: Factory<T>,
    options?: GetOrSetOptions | undefined
  ): Promise<T> {
    return this.#configCache.getOrSet<T>(key, factory, options);
  }

  public getConfig<T>(
    key: string,
    defaultValue?: Factory<T> | undefined,
    options?: GetOptions | undefined
  ): Promise<T> {
    return this.#configCache.get<T>(key, defaultValue, options);
  }

  public setConfig(
    key: string,
    value: any,
    options?: GetOrSetOptions | undefined
  ) {
    return this.#configCache.set(key, value, options);
  }

  public hasConfig(
    key: string,
    options?: HasOptions | undefined
  ): Promise<boolean> {
    return this.#configCache.has(key, options);
  }

  protected createCacheManager(
    options: StormCacheOptions
  ): BentoCache<Record<string, ReturnType<typeof bentostore>>> {
    return new BentoCache({
      default: "store",
      logger: this.trace,
      prefix: "storm",
      stores: {
        store: bentostore()
          .useL1Layer(
            memoryDriver({
              maxSize: 20 * 1024 * 1024,
              maxItems: 6000
            })
          )
          .useL2Layer(
            fileDriver({
              directory:
                this.#config.cacheDirectory &&
                isAbsolute(this.#config.cacheDirectory)
                  ? this.#config.cacheDirectory
                  : joinPaths(
                      this.#config.workstationRoot,
                      this.#config.cacheDirectory ||
                        "./node_modules/.cache/storm"
                    )
            })
          )
          .useBus(
            notificationBusDriver({
              retryQueue: {
                enabled: true
              }
            })
          )
      },
      ...options
    });
  }
}
