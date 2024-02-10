import type { StormConfig } from "@storm-software/config";
import { StormTrace } from "@storm-stack/telemetry";
import { BentoCache, bentostore } from "bentocache";
import { fileDriver } from "bentocache/drivers/file";
import { memoryDriver } from "bentocache/drivers/memory";
import type {
  BusOptions,
  CacheProvider,
  Factory,
  FileConfig,
  GetOptions,
  GetOrSetOptions,
  HasOptions,
  MemoryConfig,
  RawBentoCacheOptions
} from "bentocache/types";
import { notificationBusDriver } from "./notification-bus";

export interface StormCacheOptions extends Partial<RawBentoCacheOptions> {
  store?: ReturnType<typeof bentostore>;
  memory?: Partial<MemoryConfig>;
  file?: Partial<FileConfig>;
  bus?: Partial<BusOptions>;
}

export class StormCache {
  public static create(config: StormConfig, trace?: StormTrace) {
    return new StormCache(config, trace);
  }

  #config: StormConfig;
  #trace: StormTrace;
  #cache: BentoCache<{ store: ReturnType<typeof bentostore> }>;
  #configCache: CacheProvider;

  private constructor(config: StormConfig, trace?: StormTrace, options: StormCacheOptions = {}) {
    this.#config = config;
    this.#trace = trace ?? StormTrace.create("storm-cache", this.#config);

    this.#cache = new BentoCache({
      default: "store",
      logger: this.#trace,
      prefix: options.prefix ? options.prefix : "storm-",
      stores: {
        store: options.store
          ? options.store
          : bentostore()
              .useL1Layer(
                memoryDriver({
                  maxSize: options.memory?.maxSize ? options.memory?.maxSize : 20 * 1024 * 1024,
                  maxItems: options.memory?.maxItems ? options.memory?.maxItems : 6000,
                  maxEntrySize: options.memory?.maxEntrySize
                })
              )
              .useL2Layer(
                fileDriver({
                  directory: options.file?.directory
                    ? options.file?.directory
                    : this.#config.cacheDirectory
                })
              )
              .useBus(notificationBusDriver(options.bus))
      },
      ...options
    });

    this.#configCache = this.#cache.namespace("config");
    this.#configCache.setForever("config", this.#config);

    this.#trace.debug("StormCache initialization has completed successfully...");
  }

  public get cache(): BentoCache<{ store: ReturnType<typeof bentostore> }> {
    return this.#cache;
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
    return this.#cache.getOrSet<T>(key, factory, options);
  }

  public get<T>(
    key: string,
    defaultValue?: Factory<T> | undefined,
    options?: GetOptions | undefined
  ): Promise<T> {
    return this.#cache.get<T>(key, defaultValue, options);
  }

  public set(key: string, value: any, options?: GetOrSetOptions | undefined) {
    return this.#cache.set(key, value, options);
  }

  public has(key: string, options?: HasOptions | undefined): Promise<boolean> {
    return this.#cache.has(key, options);
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

  public setConfig(key: string, value: any, options?: GetOrSetOptions | undefined) {
    return this.#configCache.set(key, value, options);
  }

  public hasConfig(key: string, options?: HasOptions | undefined): Promise<boolean> {
    return this.#configCache.has(key, options);
  }
}
