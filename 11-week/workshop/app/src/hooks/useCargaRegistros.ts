import { useCallback, useEffect, useState } from 'react';

export type EstadoRegistros = 'cargando' | 'listo' | 'error';

const DEMORA_MS = Number(process.env.EXPO_PUBLIC_DEMORA_MS ?? 1000);

/**
 * Mientras no exista el endpoint de registros, la peticion se simula:
 * EXPO_PUBLIC_DEMORA_MS controla la espera y EXPO_PUBLIC_FALLA_REGISTROS=1 la hace fallar.
 */
export function pedirRegistros(): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (process.env.EXPO_PUBLIC_FALLA_REGISTROS === '1') {
        reject(new Error('No hubo respuesta del servidor'));
      } else {
        resolve();
      }
    }, DEMORA_MS);
  });
}

export function useCargaRegistros(pedir: () => Promise<void> = pedirRegistros) {
  const [estado, setEstado] = useState<EstadoRegistros>('cargando');
  const [recargando, setRecargando] = useState(false);

  const cargar = useCallback(() => {
    setEstado('cargando');
    pedir()
      .then(() => setEstado('listo'))
      .catch(() => setEstado('error'));
  }, [pedir]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const recargar = useCallback(() => {
    setRecargando(true);
    pedir()
      .catch(() => setEstado('error'))
      .finally(() => setRecargando(false));
  }, [pedir]);

  return { estado, cargar, recargando, recargar };
}
