# W11 · Taller UX/UI sobre Healthy Habits Tracker

<!-- CONFIG-START -->
- FULL_NAME: Daniel Felipe Fernández Rojas
- GITHUB_USER: Daniel666-ui
- TEAM: Healthy Habits Tracker
- DOCS_REPO: https://github.com/code-corhuila/habits-tracker-docs
- CODE_REPO: https://github.com/code-corhuila/healthy-habits-tracker
- BASELINE: team app, copia sin cambios de healthy-habits-tracker (rama main, commit 8a9966f)
- REFLECTION_DOC: PEGA_AQUI_LA_URL_DE_TU_DOCUMENTO
- MY_SCREENS:
<!-- CONFIG-END -->

## Sobre la app

La carpeta `app/` contiene la app de mi equipo sin modificar. Usa React Native con Expo SDK 57; por eso, donde la guía del taller nombra componentes de Ionic, uso los de React Native: `RefreshControl` hace el papel de `IonRefresher`, unas filas grises reemplazan a `IonSkeletonText` y las pruebas corren con Jest y React Native Testing Library.

El único cambio previo al taller fue agregar las dependencias web de Expo, en un commit separado de la línea base, para poder abrir la app en el navegador como pide el CP0.

Cómo ejecutarla:

```bash
cd app
npm install
npm run web
```
