import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { colors, fontSize, radius, semanticos, spacing } from '../constants/theme';

/** Toast de confirmacion que aparece abajo de la pantalla (cumple el papel de IonToast). */
export default function AvisoFlotante({ texto }: { texto: string }) {
  const opacidad = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (texto) Animated.timing(opacidad, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [texto, opacidad]);

  if (!texto) return null;
  return (
    <Animated.View style={[styles.aviso, { opacity: opacidad }]} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Text style={styles.texto}>{texto}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  aviso: {
    position: 'absolute',
    bottom: spacing.xxl,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: semanticos.exito,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  texto: { color: colors.bg, fontSize: fontSize.sm, fontWeight: '700' },
});
