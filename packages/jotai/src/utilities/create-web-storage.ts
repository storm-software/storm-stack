import { StormParser } from "@storm-stack/serialization";
import { isPromiseLike } from "@storm-stack/utilities";
import {
  AsyncStorage,
  AsyncStringStorage,
  SyncStorage,
  SyncStringStorage
} from "jotai/vanilla/utils/atomWithStorage";

export function createWebStorage<TValue>(
  getStringStorage: () => AsyncStringStorage | SyncStringStorage | undefined
): AsyncStorage<TValue> | SyncStorage<TValue> {
  let lastStrValue: string | undefined;
  let lastValue: any;

  const storage: AsyncStorage<TValue> | SyncStorage<TValue> = {
    getItem: (key, initialValue) => {
      const parse = (strValue: string | null) => {
        strValue = strValue || "";
        if (lastStrValue !== strValue) {
          try {
            lastValue = parse(strValue);
          } catch {
            return initialValue;
          }
          lastStrValue = strValue;
        }
        return lastValue;
      };
      const strValue = getStringStorage()?.getItem(key) ?? null;
      if (isPromiseLike(strValue)) {
        return strValue.then(parse);
      }

      return parse(strValue);
    },
    setItem: (key, newValue) =>
      getStringStorage()?.setItem(key, StormParser.stringify(newValue)),
    removeItem: key => getStringStorage()?.removeItem(key)
  };

  if (
    typeof window !== "undefined" &&
    typeof window.addEventListener === "function" &&
    window.Storage
  ) {
    storage.subscribe = (key, callback, initialValue) => {
      if (!(getStringStorage() instanceof window.Storage)) {
        return () => {};
      }

      const storageEventCallback = (e: StorageEvent) => {
        if (e.storageArea === getStringStorage() && e.key === key) {
          let newValue: TValue;
          try {
            newValue = JSON.parse(e.newValue || "");
          } catch {
            newValue = initialValue;
          }
          callback(newValue);
        }
      };

      window.addEventListener("storage", storageEventCallback);
      return () => {
        window.removeEventListener("storage", storageEventCallback);
      };
    };
  }

  return storage;
}
