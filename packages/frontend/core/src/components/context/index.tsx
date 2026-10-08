import { ConfirmModalProvider, PromptModalProvider } from '@nexio/component';
import { ProviderComposer } from '@nexio/component/provider-composer';
import { ThemeProvider } from '@nexio/core/components/theme-provider';
import type { createStore } from 'jotai';
import { Provider } from 'jotai';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

import { useImageAntialiasing } from '../hooks/use-image-antialiasing';

export type NexioContextProps = PropsWithChildren<{
  store?: ReturnType<typeof createStore>;
}>;

export function NexioContext(props: NexioContextProps) {
  useImageAntialiasing();
  return (
    <ProviderComposer
      contexts={useMemo(
        () =>
          [
            <Provider key="JotaiProvider" store={props.store} />,
            <ThemeProvider key="ThemeProvider" />,
            <ConfirmModalProvider key="ConfirmModalProvider" />,
            <PromptModalProvider key="PromptModalProvider" />,
          ].filter(Boolean),
        [props.store]
      )}
    >
      {props.children}
    </ProviderComposer>
  );
}

// Backwards compatibility aliases
export const AffineContext = NexioContext;
export type AffineContextProps = NexioContextProps;
