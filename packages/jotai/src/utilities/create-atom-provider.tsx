import { Provider as AtomProvider } from "jotai";
import { createStore } from "jotai/vanilla";
import React, { type ComponentProps, useContext, useEffect, useMemo, useState } from "react";
import { useHydrateStore, useSyncStore } from "../hooks";
import type { JotaiStore, SimpleWritableAtomRecord } from "./create-atom-store";

type AtomProviderProps = ComponentProps<typeof AtomProvider>;

const getFullyQualifiedScope = (storeName: string, scope: string) => {
  return `${storeName}:${scope}`;
};

/**
 * Context mapping store name and scope to store. The 'provider' scope is used
 * to reference any provider belonging to the store, regardless of scope.
 */
const PROVIDER_SCOPE = "provider";
const AtomStoreContext = React.createContext<Map<string, JotaiStore>>(new Map());

/**
 * Tries to find a store in each of the following places, in order:
 * 1. The store context, matching the store name and scope
 * 2. The store context, matching the store name and 'provider' scope
 * 3. Otherwise, return undefined
 */
export const useAtomStore = (
  storeName: string,
  scope: string = PROVIDER_SCOPE,
  warnIfUndefined = true
): JotaiStore | undefined => {
  const storeContext = useContext(AtomStoreContext);
  const store =
    storeContext.get(getFullyQualifiedScope(storeName, scope)) ??
    storeContext.get(getFullyQualifiedScope(storeName, PROVIDER_SCOPE));

  if (!store && warnIfUndefined) {
    console.warn(`Tried to access jotai store '${storeName}' outside of a matching provider.`);
  }

  return store;
};

export type ProviderProps<T extends object> = AtomProviderProps &
  Partial<T> & {
    scope?: string;
    initialValues?: Partial<T>;
    resetKey?: any;
  };

export const HydrateAtoms = <T extends object>({
  initialValues,
  children,
  store,
  atoms,
  ...props
}: Omit<ProviderProps<T>, "scope"> & {
  atoms: SimpleWritableAtomRecord<T>;
}) => {
  useHydrateStore(atoms, { ...initialValues, ...props } as any, {
    store
  });
  useSyncStore(atoms, props as any, {
    store
  });

  return <>{children}</>;
};

/**
 * Creates a generic provider for a jotai store.
 * - `initialValues`: Initial values for the store.
 * - `props`: Dynamic values for the store.
 */
export const createAtomProvider = <T extends object, N extends string = "">(
  storeScope: N,
  atoms: SimpleWritableAtomRecord<T>,
  options: { effect?: React.FC } = {}
) => {
  const Effect = options.effect;

  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  return ({ store, scope, children, resetKey, ...props }: ProviderProps<T>) => {
    // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
    const [storeState, setStoreState] = useState<JotaiStore>(createStore());

    // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
    useEffect(() => {
      if (resetKey) {
        setStoreState(createStore());
      }
    }, [resetKey]);

    // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
    const previousStoreContext = useContext(AtomStoreContext);

    // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
    const storeContext = useMemo(() => {
      const newStoreContext = new Map(previousStoreContext);

      if (scope) {
        // Make the store findable by its fully qualified scope
        newStoreContext.set(getFullyQualifiedScope(storeScope, scope), storeState);
      }

      // Make the store findable by its store name alone
      newStoreContext.set(getFullyQualifiedScope(storeScope, PROVIDER_SCOPE), storeState);

      return newStoreContext;
    }, [previousStoreContext, scope, storeState, storeScope]);

    return (
      <AtomStoreContext.Provider value={storeContext}>
        <AtomProvider store={storeState}>
          <HydrateAtoms store={storeState} atoms={atoms} {...(props as any)}>
            {!!Effect && <Effect />}
            {children}
          </HydrateAtoms>
        </AtomProvider>
      </AtomStoreContext.Provider>
    );
  };
};
