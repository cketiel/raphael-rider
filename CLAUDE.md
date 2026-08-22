@AGENTS.md

# Raphael.Rider — React Native + Expo

App del pasajero. Parte del ecosistema Raphael (NEMT). Reglas globales: `../CLAUDE.md`.

## Rol
El paciente ve sus viajes, sigue al vehículo en vivo, recibe notificaciones y califica el servicio.
Es la única superficie del ecosistema que ve directamente el paciente.

## Contrato con la API
- Auth: **JWT** → `src/store/useAuthStore.ts`
- Superficie HTTP: `src/api/apiClient.ts`
- Config/base URL: `src/constants/Config.ts`
- **Tipos espejo del backend: `src/domain/types.ts`** — mantenidos a mano contra
  `Raphael.Backend/Raphael.Shared/DTOs/`. Es el punto de sincronía de contratos de esta app.
  Ver `../_meta/CONTRACT_MAP.md`.

Ventaja frente a Desktop/Driver: aquí un rename de campo **rompe la compilación** en vez de romper
en silencio en producción. Aprovéchalo: tipa, no uses `any`.

## Anclas
- Entrada: `App.tsx` → `src/navigation/RootNavigator.tsx`
- Tiempo real: `src/hooks/useSignalR.ts` + `src/services/signalRService.ts`
- Notificaciones: `src/services/notificationService.ts` + `src/store/useNotificationStore.ts`
- Pantallas: `src/screens/{auth,main}/`
- Estado: Zustand en `src/store/` — no Context API, no Redux

## Convenciones no obvias
- **Expo v57**: leer las docs versionadas antes de escribir código (regla de `AGENTS.md`, arriba).
- i18n obligatorio: texto visible pasa por `src/i18n/`, nunca hardcodeado en la pantalla.
- `src/services/mockData.ts` es solo desarrollo. No debe alcanzar una pantalla en producción.
- PHI en pantalla: nunca a `console.log` ni a servicios de crash reporting.

## No leer
`node_modules/`, `.expo/`, `package-lock.json`, `assets/`, `google-services.json`, `credentials.json`

## Versionado y canal de testers internos

**No está en producción.** Versión `0.x` mientras siga siendo pre-release — `1.0.0` habría afirmado
estabilidad que aún no existe.

- Versión: `version` en `app.config.js` y `package.json`, **siempre iguales**. Hoy: `0.1.0`.
  Todavía no se muestra en pantalla (pendiente para cuando se libere).
- **Canal de testers = perfil `preview` de `eas.json`** (`android: apk`, `ios: internal`):
  `eas build --profile preview`
- Cada build para testers se taguea `v0.1.0-preview.N` y se publica como **pre-release** en GitHub
  con el APK/IPA adjunto. Así los testers dejan de recibir binarios anónimos.
- `appVersionSource: "remote"` → el build number lo gestiona EAS. No tocarlo.
- Doctrina completa: `../_meta/GIT_WORKFLOW.md`

## Comandos
- Dev: `npm start` · Android: `npm run android` · iOS: `npm run ios` · Web: `npm run web`
- Build testers: `eas build --profile preview`
- Test: no hay suite configurada.
