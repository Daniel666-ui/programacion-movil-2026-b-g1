import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '../components/AppButton';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import RegistrosCargando from '../components/RegistrosCargando';
import { colors, fontSize, radius, semanticos, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useCargaRegistros } from '../hooks/useCargaRegistros';
import type { RootStackParamList } from '../types';
import { fechaLarga } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistroDetalle'>;

/** Simula el GET de un registro; EXPO_PUBLIC_FALLA_DETALLE_REGISTRO=1 lo hace fallar. */
const pedirDetalle = () =>
  new Promise<void>((resolve, reject) =>
    setTimeout(
      () => (process.env.EXPO_PUBLIC_FALLA_DETALLE_REGISTRO === '1' ? reject(new Error('Sin respuesta')) : resolve()),
      Number(process.env.EXPO_PUBLIC_DEMORA_MS ?? 1000),
    ),
  );

export default function RegistroDetalleScreen({ navigation, route }: Props) {
  const { registros, habitoPorId, metaActivaDe, eliminarRegistro } = useApp();
  const { estado, cargar } = useCargaRegistros(pedirDetalle);
  const [confirmando, setConfirmando] = useState(false);

  const registro = registros.find((r) => r.id === Number(route.params.id));
  const habito = registro ? habitoPorId(registro.habitoId) : undefined;
  const meta = registro ? metaActivaDe(registro.habitoId) : undefined;

  const regresar = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Tabs'));
  const eliminar = () => {
    if (registro) eliminarRegistro(registro.id);
    regresar();
  };

  let contenido: React.ReactNode;
  if (estado === 'cargando') contenido = <RegistrosCargando />;
  else if (estado === 'error')
    contenido = (
      <EmptyState icono="⚠️" titulo="No pudimos abrir este registro" mensaje="Revisa tu conexion y vuelve a intentarlo." accion={{ titulo: 'Reintentar', onPress: cargar }} />
    );
  else if (!registro)
    contenido = (
      <EmptyState icono="🗂️" titulo="Registro no encontrado" mensaje={`No hay ningun registro con el numero ${route.params.id}; puede que se haya eliminado.`} accion={{ titulo: 'Ir a Registros', onPress: regresar }} />
    );
  else
    contenido = (
      <ScrollView contentContainerStyle={styles.cuerpo}>
        <Text style={styles.habito} accessibilityRole="header">{habito?.nombre ?? 'Habito eliminado'}</Text>
        <Text style={styles.fecha}>{fechaLarga(registro.fecha)}</Text>
        <Card>
          <Text style={styles.valor}>
            {registro.valorRegistrado} {habito?.unidadMedida}
          </Text>
          <Text style={[styles.cumplimiento, { color: registro.metaCumplida ? semanticos.exito : semanticos.textoSecundario }]}>
            {registro.metaCumplida ? 'Meta cumplida' : 'Meta sin cumplir'}
            {meta ? ` · objetivo ${meta.valorObjetivo} ${habito?.unidadMedida}` : ' · el habito no tiene meta activa'}
          </Text>
        </Card>
        <Text style={styles.titulo}>Notas</Text>
        <Text style={styles.notas}>{registro.notas ?? 'Sin notas para este dia.'}</Text>
        <AppButton titulo="Registrar otro dia" onPress={() => navigation.navigate('NuevoRegistro', { habitoId: registro.habitoId })} />
        {confirmando ? (
          <View style={styles.confirmacion} accessibilityRole="alert">
            <Text style={styles.textoConfirmacion}>¿Eliminar este registro? No se puede deshacer.</Text>
            <View style={styles.acciones}>
              <AppButton titulo="Conservar" variante="secundario" onPress={() => setConfirmando(false)} style={styles.flex} />
              <AppButton titulo="Eliminar" variante="peligro" onPress={eliminar} style={styles.flex} />
            </View>
          </View>
        ) : (
          <AppButton titulo="Eliminar registro" variante="peligro" onPress={() => setConfirmando(true)} />
        )}
      </ScrollView>
    );

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Pressable onPress={regresar} style={styles.regresar} accessibilityRole="button" accessibilityLabel="Regresar a Registros">
        <Text style={styles.regresarTexto}>← Registros</Text>
      </Pressable>
      {contenido}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  regresar: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  regresarTexto: { color: semanticos.primario, fontSize: fontSize.md, fontWeight: '700' },
  cuerpo: { gap: spacing.md, paddingBottom: spacing.xxl },
  habito: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  fecha: { color: semanticos.textoSecundario, fontSize: fontSize.sm },
  valor: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800' },
  cumplimiento: { fontSize: fontSize.sm, fontWeight: '600', marginTop: spacing.xs },
  titulo: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  notas: { color: semanticos.textoSecundario, fontSize: fontSize.sm, fontStyle: 'italic' },
  confirmacion: { borderWidth: 1, borderColor: semanticos.error, borderRadius: radius.md, padding: spacing.md, backgroundColor: colors.redSoft },
  textoConfirmacion: { color: semanticos.error, fontSize: fontSize.sm },
  acciones: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  flex: { flex: 1 },
});
