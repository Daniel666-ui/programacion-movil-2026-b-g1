import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '../components/Card';
import ChipSelector from '../components/ChipSelector';
import EmptyState from '../components/EmptyState';
import RegistrosCargando from '../components/RegistrosCargando';
import ScreenHeader from '../components/ScreenHeader';
import { colors, fontSize, radius, semanticos, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useCargaRegistros } from '../hooks/useCargaRegistros';
import type { RootStackParamList } from '../types';
import { fechaCorta } from '../utils/date';

type Navegacion = NativeStackNavigationProp<RootStackParamList>;

const TODOS = -1;

export default function RegistrosScreen() {
  const navigation = useNavigation<Navegacion>();
  const { registros, habitos, habitoPorId, eliminarRegistro } = useApp();
  const [filtro, setFiltro] = useState<number>(TODOS);
  const { estado, cargar, recargando, recargar } = useCargaRegistros();

  const visibles = useMemo(() => {
    const lista = filtro === TODOS ? registros : registros.filter((r) => r.habitoId === filtro);
    // Mas recientes primero
    return [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [registros, filtro]);

  const confirmarEliminar = (id: number) => {
    Alert.alert('Eliminar registro', '¿Eliminar este registro diario?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminarRegistro(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <View style={styles.contenido}>
        <ScreenHeader
          titulo="📋 Registros"
          subtitulo={`${visibles.length} registros`}
          derecha={
            <Pressable
              style={styles.botonAgregar}
              onPress={() => navigation.navigate('NuevoRegistro')}
              accessibilityRole="button"
              accessibilityLabel="Nuevo registro"
            >
              <Text style={styles.botonAgregarTexto}>+</Text>
            </Pressable>
          }
        />

        <ChipSelector
          etiqueta="Filtrar por habito"
          opciones={[
            { id: TODOS, etiqueta: 'Todos' },
            ...habitos.map((h) => ({ id: h.id, etiqueta: h.nombre })),
          ]}
          seleccion={filtro}
          onSeleccionar={setFiltro}
        />

        <FlatList
          data={estado === 'listo' ? visibles : []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={recargando}
              onRefresh={recargar}
              tintColor={semanticos.primario}
              colors={[semanticos.primario]}
            />
          }
          ListEmptyComponent={
            estado === 'cargando' ? (
              <RegistrosCargando />
            ) : estado === 'error' ? (
              <EmptyState
                icono="⚠️"
                titulo="No pudimos cargar tus registros"
                mensaje="Revisa tu conexion y vuelve a intentarlo."
                accion={{ titulo: 'Reintentar', onPress: cargar }}
              />
            ) : (
              <EmptyState
                icono="📋"
                titulo="Sin registros"
                mensaje="Registra el avance de tus habitos para ver tu progreso aqui."
                accion={{
                  titulo: '+ Nuevo registro',
                  onPress: () => navigation.navigate('NuevoRegistro'),
                }}
              />
            )
          }
          renderItem={({ item }) => {
            const habito = habitoPorId(item.habitoId);
            return (
              <Card style={styles.tarjeta}>
                <View style={styles.fila}>
                  <View
                    accessible
                    accessibilityLabel={item.metaCumplida ? 'Meta cumplida' : 'Meta sin cumplir'}
                    style={[
                      styles.estado,
                      { backgroundColor: item.metaCumplida ? colors.greenSoft : colors.surface2 },
                    ]}
                  >
                    <Text style={styles.estadoIcono}>{item.metaCumplida ? '✅' : '⭕'}</Text>
                  </View>

                  <Pressable
                    style={styles.flex}
                    onPress={() => navigation.navigate('RegistroDetalle', { id: item.id })}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver registro de ${habito?.nombre ?? 'habito eliminado'} del ${fechaCorta(item.fecha)}`}
                  >
                    <Text style={styles.nombre}>{habito?.nombre ?? 'Habito eliminado'}</Text>
                    <Text style={styles.fecha}>{fechaCorta(item.fecha)}</Text>
                    {item.notas ? <Text style={styles.notas}>“{item.notas}”</Text> : null}
                  </Pressable>

                  <View style={styles.derecha}>
                    <Text
                      style={[
                        styles.valor,
                        { color: item.metaCumplida ? colors.green : colors.text },
                      ]}
                    >
                      {item.valorRegistrado}
                    </Text>
                    <Text style={styles.unidad}>{habito?.unidadMedida ?? ''}</Text>
                  </View>

                  <Pressable
                    onPress={() => confirmarEliminar(item.id)}
                    style={styles.botonEliminar}
                    accessibilityRole="button"
                    accessibilityLabel="Eliminar registro"
                  >
                    <Text style={styles.eliminar}>✕</Text>
                  </Pressable>
                </View>
              </Card>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  contenido: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  flex: { flex: 1 },
  lista: { gap: spacing.sm + 2, paddingBottom: spacing.xxl },
  tarjeta: { padding: spacing.md },
  botonAgregar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonAgregarTexto: { color: colors.bg, fontSize: 24, fontWeight: '800', lineHeight: 28 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  estado: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estadoIcono: { fontSize: 18 },
  nombre: { color: colors.text, fontSize: fontSize.sm + 1, fontWeight: '600' },
  fecha: { color: colors.muted, fontSize: fontSize.xs + 1, marginTop: 2 },
  notas: { color: semanticos.textoSecundario, fontSize: fontSize.xs, marginTop: 3, fontStyle: 'italic' },
  derecha: { alignItems: 'flex-end' },
  valor: { fontSize: fontSize.lg, fontWeight: '800' },
  unidad: { color: colors.muted, fontSize: fontSize.xs },
  botonEliminar: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  eliminar: { color: colors.red, fontSize: fontSize.lg },
});
