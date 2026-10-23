import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '../components/AppButton';
import AvisoFlotante from '../components/AvisoFlotante';
import Card from '../components/Card';
import ChipSelector from '../components/ChipSelector';
import Input from '../components/Input';
import ScreenHeader from '../components/ScreenHeader';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useFormularioRegistro } from '../hooks/useFormularioRegistro';
import type { RootStackParamList } from '../types';
import { fechaLarga, hoyISO, sumarDias } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'NuevoRegistro'>;

export default function NuevoRegistroScreen({ navigation, route }: Props) {
  const { habitos, metaActivaDe, habitoPorId } = useApp();
  const { campos, cambiar, errores, enviando, errorServidor, guardar, guardado, tieneCambios } =
    useFormularioRegistro(route.params?.habitoId ?? null);
  const { habitoId, fecha, valor, notas } = campos;
  const [exito, setExito] = useState('');
  const [preguntarSalida, setPreguntarSalida] = useState(false);

  const habito = habitoId !== null ? habitoPorId(habitoId) : undefined;
  const meta = habitoId !== null ? metaActivaDe(habitoId) : undefined;
  const valorTocado = valor !== '';

  const salir = () => (tieneCambios ? setPreguntarSalida(true) : navigation.goBack());

  const enviar = async () => {
    const resultado = await guardar();
    if (!resultado?.ok) return;
    setExito(resultado.mensaje ?? 'Registro guardado');
    setTimeout(() => navigation.goBack(), 1500);
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeader
            titulo="📝 Nuevo registro"
            subtitulo="Anota tu avance del dia"
            derecha={
              <Text style={styles.cerrar} onPress={salir} accessibilityRole="button">
                Cerrar
              </Text>
            }
          />

          <Card>
            {preguntarSalida ? (
              <View style={[styles.mensaje, styles.mensajeError]} accessibilityRole="alert">
                <Text style={styles.textoError}>¿Salir sin guardar? Se perderan el valor y las notas.</Text>
                <View style={styles.accionesSalida}>
                  <AppButton titulo="Seguir editando" variante="secundario" onPress={() => setPreguntarSalida(false)} style={styles.flex} />
                  <AppButton titulo="Salir" variante="peligro" onPress={() => navigation.goBack()} style={styles.flex} />
                </View>
              </View>
            ) : null}
            {errorServidor ? (
              <View style={[styles.mensaje, styles.mensajeError]} accessibilityRole="alert">
                <Text style={styles.textoError}>⚠️ {errorServidor}</Text>
              </View>
            ) : null}

            <View style={styles.formulario}>
              <ChipSelector
                etiqueta="Habito *"
                opciones={habitos.map((h) => ({ id: h.id, etiqueta: h.nombre }))}
                seleccion={habitoId}
                onSeleccionar={(id) => cambiar('habitoId', id)}
              />
              <MensajeCampo texto={valorTocado ? errores.habitoId : undefined} />

              <View>
                <Text style={styles.etiqueta}>FECHA *</Text>
                <View style={styles.selectorFecha}>
                  <Text
                    style={styles.flecha}
                    onPress={() => cambiar('fecha', sumarDias(fecha, -1))}
                    accessibilityLabel="Dia anterior"
                  >
                    ‹
                  </Text>
                  <Text style={styles.fechaTexto}>{fechaLarga(fecha)}</Text>
                  <Text
                    style={[styles.flecha, fecha >= hoyISO() ? styles.flechaInactiva : null]}
                    onPress={() => {
                      if (fecha < hoyISO()) cambiar('fecha', sumarDias(fecha, 1));
                    }}
                    accessibilityLabel="Dia siguiente"
                  >
                    ›
                  </Text>
                </View>
                <MensajeCampo texto={errores.fecha} />
              </View>

              <Input
                etiqueta={`Valor registrado * ${habito ? `(${habito.unidadMedida})` : ''}`}
                valor={valor}
                onChange={(texto) => cambiar('valor', texto)}
                placeholder="8"
                tipoTeclado="numeric"
              />
              <MensajeCampo texto={valorTocado ? errores.valor : undefined} />

              {meta ? (
                <View style={styles.pistaMeta}>
                  <Text style={styles.pistaTexto}>
                    🎯 Meta activa: {meta.valorObjetivo} {habito?.unidadMedida}
                  </Text>
                </View>
              ) : habitoId !== null ? (
                <View style={styles.pistaMeta}>
                  <Text style={styles.pistaTexto}>
                    Este habito no tiene meta activa: el registro se guardara sin cumplimiento.
                  </Text>
                </View>
              ) : null}

              <Input
                etiqueta="Notas"
                valor={notas}
                onChange={(texto) => cambiar('notas', texto)}
                placeholder="¿Como te fue hoy? (opcional)"
                multilinea
              />

              {enviando ? (
                <View style={styles.guardando} accessibilityLiveRegion="polite">
                  <ActivityIndicator color={colors.teal} />
                  <Text style={styles.pistaTexto}>Guardando registro…</Text>
                </View>
              ) : (
                <AppButton
                  titulo="Guardar registro"
                  onPress={enviar}
                  deshabilitado={Object.keys(errores).length > 0 || guardado}
                />
              )}
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
      <AvisoFlotante texto={exito} />
    </SafeAreaView>
  );
}

function MensajeCampo({ texto }: { texto?: string }) {
  return texto ? <Text style={styles.errorCampo}>{texto}</Text> : null;
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  contenido: { padding: spacing.lg, paddingBottom: spacing.xxl },
  cerrar: { color: colors.muted, fontSize: fontSize.sm, fontWeight: '600' },
  formulario: { gap: spacing.lg },
  etiqueta: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  selectorFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  flecha: {
    color: colors.teal,
    fontSize: 26,
    fontWeight: '800',
    paddingHorizontal: spacing.sm,
    lineHeight: 30,
  },
  flechaInactiva: { color: colors.subtle },
  fechaTexto: { color: colors.text, fontSize: fontSize.sm + 1, fontWeight: '600' },
  pistaMeta: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  pistaTexto: { color: colors.muted, fontSize: fontSize.sm, lineHeight: 19 },
  mensaje: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  mensajeError: { backgroundColor: colors.redSoft, borderColor: colors.red },
  textoError: { color: colors.red, fontSize: fontSize.sm },
  errorCampo: { color: colors.red, fontSize: fontSize.sm, marginTop: spacing.xs },
  accionesSalida: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  guardando: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md },
});
