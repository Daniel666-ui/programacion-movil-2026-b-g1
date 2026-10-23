import { useState } from 'react';

import { useApp } from '../context/AppContext';
import { hoyISO } from '../utils/date';

export interface CamposRegistro {
  habitoId: number | null;
  fecha: string;
  valor: string;
  notas: string;
}

type Errores = Partial<Record<'habitoId' | 'fecha' | 'valor', string>>;

const DEMORA_GUARDADO_MS = Number(process.env.EXPO_PUBLIC_DEMORA_MS ?? 1000);

/** Simula el POST de un registro diario; EXPO_PUBLIC_FALLA_GUARDAR_REGISTRO=1 lo hace fallar. */
function enviarRegistro(): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (process.env.EXPO_PUBLIC_FALLA_GUARDAR_REGISTRO === '1') reject(new Error('Sin respuesta'));
      else resolve();
    }, DEMORA_GUARDADO_MS);
  });
}

export function useFormularioRegistro(habitoInicial: number | null) {
  const { registros, crearRegistro } = useApp();
  const [campos, setCampos] = useState<CamposRegistro>({
    habitoId: habitoInicial,
    fecha: hoyISO(),
    valor: '',
    notas: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');
  const [guardado, setGuardado] = useState(false);

  const errores: Errores = {};
  if (campos.habitoId === null) errores.habitoId = 'Elige el habito que vas a registrar';
  if (campos.fecha > hoyISO()) errores.fecha = 'No puedes registrar un dia que aun no llega';
  else if (!guardado && registros.some((r) => r.habitoId === campos.habitoId && r.fecha === campos.fecha)) {
    errores.fecha = 'Ya registraste este habito ese dia; elige otra fecha';
  }
  const numero = Number(campos.valor.replace(',', '.'));
  if (!campos.valor.trim()) errores.valor = 'Escribe cuanto hiciste';
  else if (Number.isNaN(numero) || numero < 0) errores.valor = 'Debe ser un numero de cero en adelante';

  const cambiar = <K extends keyof CamposRegistro>(campo: K, valor: CamposRegistro[K]) =>
    setCampos((previos) => ({ ...previos, [campo]: valor }));

  const guardar = async () => {
    if (enviando || guardado || campos.habitoId === null || Object.keys(errores).length > 0) return null;
    setEnviando(true);
    setErrorServidor('');
    try {
      await enviarRegistro();
      const resultado = crearRegistro({ habitoId: campos.habitoId, fecha: campos.fecha, valorRegistrado: numero, notas: campos.notas });
      setGuardado(resultado.ok);
      return resultado;
    } catch {
      setErrorServidor('No pudimos guardar el registro. Tus datos siguen aqui; intentalo otra vez.');
      return null;
    } finally {
      setEnviando(false);
    }
  };

  const tieneCambios = campos.valor.trim() !== '' || campos.notas.trim() !== '';

  return { campos, cambiar, errores, enviando, errorServidor, guardar, guardado, tieneCambios };
}
