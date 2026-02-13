import { ConfirmModalProvider, PromptModalProvider } from '@nexio/component';
import { ProviderComposer } from '@nexio/component/provider-composer';
import { ThemeProvider } from '@nexio/core/components/theme-provider';
import type { createStore } from 'jotai';
import { Provider } from 'jotai';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

export type NexioContextProps = PropsWithChildren<{
  store?: ReturnType<typeof createStore>;
}>;

export function NexioContext(props: NexioContextProps) {
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
