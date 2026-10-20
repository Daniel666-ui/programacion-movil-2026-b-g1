import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';
import Card from './Card';

const FILAS = 4;

/** Filas grises con la misma distribucion de un registro diario: estado, habito y fecha, valor. */
export default function RegistrosCargando() {
  return (
    <View style={styles.lista} accessibilityLabel="Cargando registros">
      {Array.from({ length: FILAS }, (_, indice) => (
        <Card key={indice} style={styles.tarjeta}>
          <View style={styles.fila}>
            <View style={styles.estado} />
            <View style={styles.textos}>
              <View style={[styles.bloque, styles.habito]} />
              <View style={[styles.bloque, styles.fecha]} />
            </View>
            <View style={[styles.bloque, styles.valor]} />
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: { gap: spacing.sm + 2 },
  tarjeta: { padding: spacing.md },
  fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  estado: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surface2 },
  textos: { flex: 1, gap: spacing.xs + 2 },
  bloque: { borderRadius: radius.sm, backgroundColor: colors.surface2 },
  habito: { width: '55%', height: 12 },
  fecha: { width: '30%', height: 10 },
  valor: { width: 36, height: 20 },
});
