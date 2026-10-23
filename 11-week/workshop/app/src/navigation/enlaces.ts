import type { LinkingOptions } from '@react-navigation/native';

import type { RootStackParamList } from '../types';

/** Rutas web: /registros es la pestaña y /registros/7 abre el detalle del registro 7. */
export const enlaces: LinkingOptions<RootStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      Tabs: { screens: { Registros: 'registros' } },
      RegistroDetalle: { path: 'registros/:id', parse: { id: Number } },
    },
  },
};
