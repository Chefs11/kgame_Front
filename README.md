# kgame_Front

Interfaz de **kgame**, un juego tipo Kahoot para repasar *Ética y Legislación en TI*
(proyecto final, UTEZ). Backend: [kgame_Back](https://github.com/Chefs11/kgame_Back).

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · socket.io-client

## Puesta en marcha
```bash
cp .env.example .env.local   # URL del backend
npm install
npm run dev                  # http://localhost:3001
```
El backend debe estar corriendo en `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:3000`).

## Scripts
| Comando | Qué hace |
|---|---|
| `npm run dev` | Desarrollo en el puerto 3001 |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |

## Estructura
```
src/
  app/             rutas (inicio, /privacidad)
  lib/socket.ts    cliente Socket.IO compartido
```

## Legal
Licencia MIT (ver `LICENSE`). Recursos de terceros en `ATTRIBUTIONS.md`.
Aviso de privacidad en `/privacidad` (pendiente de redactar).
