# MENSAJES DE FE – Generador de Videos Bíblicos

Proyecto listo para ejecutarse localmente o en Coolify. El flujo está implementado con comportamiento real: backend Express + Prisma + BullMQ + FFmpeg, frontend Next.js, modo demo offline sin APIs pagas, con TTS real cuando se configuren las variables.

## Estructura

```
mensajes-de-fe/
├── apps/
│   ├── api/     Backend Node.js + Express
│   └── web/     Frontend Next.js
└── docker-compose.yml
```

## Variables de entorno

Copia `.env.example` a `.env` y ajusta:

- `POSTGRES_*`
- `REDIS_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `AI_TEXT_PROVIDER`, `AI_IMAGE_PROVIDER`, `TTS_PROVIDER`
- `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `GEMINI_API_KEY`
- `BRAND_NAME`

## Docker rápido

```bash
cp .env.example .env
docker compose up -d
docker compose exec api pnpm run db:push
docker compose exec api pnpm run db:seed
```

Abre:
- Frontend: http://localhost:3000
- API: http://localhost:4000/health
- Login: `ADMIN_EMAIL` / `ADMIN_PASSWORD`

## Coolify

1. Conecta el repositorio en Coolify.
2. Usa `docker-compose.yml` como plantilla.
3. Expone o proxy puertos `3000` y `4000`.
4. Agrega volumen bind persistente para `apps/api/output`.
5. Carga todas las variables de `.env.example`.
6. Deploy.

## Endpoints

- `POST /api/auth/login`
- `GET /api/videos`
- `POST /api/videos`
- `GET /api/videos/:id`
- `GET /api/videos/:id/status`
- `POST /api/videos/:id/generate`
- `POST /api/videos/:id/regenerate`
- `DELETE /api/videos/:id`
- `GET /api/admin/stats`
- `GET /health`

## APIs opcionales

- Texto: OpenAI / Gemini
- Imagen/video: proveedores compatibles por env
- Voz: OpenAI TTS / ElevenLabs
- Música: assets en `/app/public/music/*.mp3`

Si no configuras APIs, el modo demo genera un MP4 real con FFmpeg.
