import { Maybe } from '@shared/src';

export const environment = {
  production: true,
  apiUrl: 'https://descartes-square.bishko.site/api',
  appName: 'Descartes Square',
  version: '1.0.0',
  enableDebugTools: false,
  logLevel: 'error',
  locale: $localize.locale as Maybe<string>,
};
