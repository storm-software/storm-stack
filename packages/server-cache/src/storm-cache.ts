import type { StormConfig } from "@storm-software/config";
import { StormTrace } from "@storm-stack/telemetry";
import { BentoCache, bentostore } from "bentocache";
import { fileDriver } from "bentocache/drivers/file";
import { memoryDriver } from "bentocache/drivers/memory";
import type {
  BusOptions,
  CacheProvider,
  FileConfig,
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
}
