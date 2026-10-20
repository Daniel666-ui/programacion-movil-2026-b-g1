import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider } from '../../context/AppContext';
import RegistrosScreen from '../RegistrosScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

const METRICAS = {
  frame: { x: 0, y: 0, width: 360, height: 760 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

async function abrirRegistros() {
  await render(
    <SafeAreaProvider initialMetrics={METRICAS}>
      <AppProvider>
        <RegistrosScreen />
      </AppProvider>
    </SafeAreaProvider>,
  );
}

async function esperarRespuesta() {
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
}

describe('Pantalla Registros', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_FALLA_REGISTROS;
    jest.useRealTimers();
  });

  it('muestra el error cuando el servidor no responde', async () => {
    process.env.EXPO_PUBLIC_FALLA_REGISTROS = '1';
    await abrirRegistros();
    await esperarRespuesta();

    expect(screen.getByText('No pudimos cargar tus registros')).toBeTruthy();
  });

  it('Reintentar vuelve a pedir los registros', async () => {
    process.env.EXPO_PUBLIC_FALLA_REGISTROS = '1';
    await abrirRegistros();
    await esperarRespuesta();

    delete process.env.EXPO_PUBLIC_FALLA_REGISTROS;
    fireEvent.press(screen.getByText('Reintentar'));

    await esperarRespuesta();
    expect(screen.queryByText('No pudimos cargar tus registros')).toBeNull();
    expect(screen.getAllByText('Beber agua').length).toBeGreaterThan(0);
  });
});
