import { createIdentifier } from '@ezeslucky/infra';

export interface ClientSchemeProvider {
  
  getClientScheme(): string | undefined;
}

export const ClientSchemeProvider = createIdentifier<ClientSchemeProvider>(
  'ClientSchemeProvider'
);
