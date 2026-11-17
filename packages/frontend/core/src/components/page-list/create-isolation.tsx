import type { Atom } from 'jotai';
import {
  createStore,
  useAtom as useJotaiAtom,
  useAtomValue as useJotaiAtomValue,
  useSetAtom as useJotaiSetAtom,
  useStore as useJotaiStore,
} from 'jotai';
import { createContext, useContext, useRef, type ReactNode } from 'react';

export function createIsolation() {
  const StoreContext = createContext<ReturnType<typeof createStore> | null>(null);

  function Provider({
    store,
    initialValues = [],
    children,
  }: {
    store?: ReturnType<typeof createStore>;
    initialValues?: Iterable<readonly [Atom<unknown>, unknown]>;
    children?: ReactNode;
  }) {
    const storeRef = useRef(store);
    if (!storeRef.current) {
      storeRef.current = createStore();
    }
    for (const [atom, value] of initialValues) {
      storeRef.current.set(atom as any, value);
    }
    return (
      <StoreContext.Provider value={storeRef.current}>
        {children}
      </StoreContext.Provider>
    );
  }

  function useScopedStore(options?: { store?: ReturnType<typeof createStore> }) {
    const contextStore = useContext(StoreContext);
    if (!contextStore) {
      throw new Error('Missing Provider from createIsolation');
    }
    return useJotaiStore({ store: contextStore, ...options });
  }

  return {
    Provider,
    useStore: useScopedStore,
    useAtom: ((anAtom: any, options?: any) => {
      const store = useScopedStore();
      return useJotaiAtom(anAtom, { store, ...options });
    }) as typeof useJotaiAtom,
    useAtomValue: ((anAtom: any, options?: any) => {
      const store = useScopedStore();
      return useJotaiAtomValue(anAtom, { store, ...options });
    }) as typeof useJotaiAtomValue,
    useSetAtom: ((anAtom: any, options?: any) => {
      const store = useScopedStore();
      return useJotaiSetAtom(anAtom, { store, ...options });
    }) as typeof useJotaiSetAtom,
  };
}
