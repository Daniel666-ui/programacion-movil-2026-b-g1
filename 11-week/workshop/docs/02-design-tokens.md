# 02 · Patrón de navegación y tokens

## Navegación

La app tiene cinco secciones a las que el usuario entra todos los días: Inicio, Hábitos, Metas, Registros e Historial. Por eso el patrón que se mantiene es **pestañas inferiores** (`@react-navigation/bottom-tabs`, en `app/src/navigation/TabNavigator.tsx`): cinco es el tope para pestañas y ninguna de esas secciones es de uso ocasional, así que no hace falta un menú lateral.

Las pantallas que no son secciones van en **pila** (`native-stack`, en `AppNavigator.tsx`): Login y Registro antes de entrar, y Nuevo registro como modal encima de la pestaña desde la que se abrió. Mis dos pantallas, Registros e Historial, son pestañas; desde Registros el botón "+" abre Nuevo registro en la pila.

## Tokens

En React Native no hay `variables.css`; los tokens viven en `app/src/constants/theme.ts`. La paleta (`colors`), los tamaños de letra (`fontSize`) y los espacios (`spacing`) ya existían. Agregué `semanticos`, que le da a cada color el rol que pide la guía:

| Rol | Token | Valor |
| --- | --- | --- |
| Primario | `semanticos.primario` | #2DD4BF |
| Secundario | `semanticos.secundario` | #58A6FF |
| Éxito | `semanticos.exito` | #3FB950 |
| Error | `semanticos.error` | #F85149 |
| Fondo | `semanticos.fondo` | #0D1117 |
| Texto secundario | `semanticos.textoSecundario` | #8B949E |
| Tamaños de letra | `fontSize` | 11, 13, 15, 18, 22 y 28 |
| Espacios | `spacing` | 4, 8, 12, 16, 24 y 32 |

**Decisión sobre `subtle`:** el gris #484F58 no llega a 4,5:1 sobre ningún fondo de la app, así que no se usa para texto. Queda para bordes y adornos, y las notas de Registros pasaron a `semanticos.textoSecundario`.

## Contraste

Calculado con la fórmula de luminancia relativa de WCAG 2.x (la del verificador de WebAIM). Fondos de la app: #0D1117 (pantalla) y #161B22 (tarjetas).

| Texto | Sobre | Relación | ≥ 4,5:1 |
| --- | --- | --- | --- |
| Texto principal #E6EDF3 | Pantalla #0D1117 | 16,02:1 | Sí |
| Texto principal #E6EDF3 | Tarjeta #161B22 | 14,64:1 | Sí |
| Texto secundario #8B949E | Pantalla #0D1117 | 6,15:1 | Sí |
| Texto secundario #8B949E | Tarjeta #161B22 | 5,62:1 | Sí |
| Primario #2DD4BF | Pantalla #0D1117 | 10,17:1 | Sí |
| Éxito #3FB950 (valor con meta cumplida) | Tarjeta #161B22 | 6,81:1 | Sí |
| Error #F85149 (✕ de eliminar) | Tarjeta #161B22 | 5,16:1 | Sí |
| Secundario #58A6FF | Tarjeta #161B22 | 6,85:1 | Sí |
| Naranja #F0883E (cumplimiento medio en Historial) | Tarjeta #161B22 | 6,83:1 | Sí |
| `subtle` #484F58 (antes, en notas) | Tarjeta #161B22 | 2,09:1 | No: ya no se usa para texto |
