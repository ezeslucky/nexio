import { createIdentifier } from '@toeverything/infra';

export interface ClientSchemeProvider {
  
  getClientScheme(): string | undefined;
}

export const ClientSchemeProvider = createIdentifier<ClientSchemeProvider>(
  'ClientSchemeProvider'
);
