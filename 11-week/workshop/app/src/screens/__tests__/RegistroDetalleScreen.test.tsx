import { describe, expect, it, jest } from '@jest/globals';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { act, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider } from '../../context/AppContext';
import type { RootStackParamList } from '../../types';
import RegistroDetalleScreen from '../RegistroDetalleScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistroDetalle'>;

async function abrirDetalle(id: number) {
  jest.useFakeTimers();
  const props = {
    navigation: { canGoBack: () => true, goBack: jest.fn(), navigate: jest.fn() },
    route: { key: 'detalle', name: 'RegistroDetalle', params: { id } },
  } as unknown as Props;
  await render(
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 360, height: 760 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
      <AppProvider>
        <RegistroDetalleScreen {...props} />
      </AppProvider>
    </SafeAreaProvider>,
  );
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
}

describe('Detalle de un registro', () => {
  it('muestra el registro que llega por la ruta', async () => {
    await abrirDetalle(1);
    expect(screen.getByText('Beber agua')).toBeTruthy();
  });

  it('avisa cuando el id no existe', async () => {
    await abrirDetalle(999);
    expect(screen.getByText('Registro no encontrado')).toBeTruthy();
  });
});
