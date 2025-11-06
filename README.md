# Invitado Afiliados Web

Aplicación fullstack construida con Next.js (App Router) para gestionar afiliados que comercializan invitaciones digitales. Incluye paneles diferenciados para **Superadmin** y **Afiliado**, inventario de "Evento-Invitación", pedidos, exportaciones CSV y recursos de marketing.

## Tabla de contenidos

- [Características](#características)
- [Stack técnico](#stack-técnico)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Requisitos previos](#requisitos-previos)
- [Configuración local](#configuración-local)
- [Scripts disponibles](#scripts-disponibles)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos y Prisma](#base-de-datos-y-prisma)
- [Seeds](#seeds)
- [Calidad y pruebas](#calidad-y-pruebas)
- [CI/CD](#cicd)
- [Despliegue sugerido](#despliegue-sugerido)
- [Project Board e Issues](#project-board-e-issues)
- [Roadmap](#roadmap)

## Características

- Autenticación con [NextAuth](https://next-auth.js.org/) usando credenciales y opción de magic link (Resend/SMTP).
- Roles: **SUPERADMIN** con control total y **AFILIADO** con acceso a inventario, pedidos y recursos.
- Gestión de afiliados con datos de perfil, redes, inventario y pedidos asignados.
- Inventario de Evento-Invitación con estados: DISPONIBLE, ASIGNADO, USADO, VENCIDO.
- Pedidos con estados: DRAFT, PENDIENTE, APROBADO, ENTREGADO, CANCELADO.
- Exportaciones CSV de pedidos e inventario.
- UI responsive mobile-first con TailwindCSS + componentes shadcn adaptados.
- Métricas y tarjetas de resumen en dashboards.
- Seeds con datos de ejemplo listos para demo.
- Protecciones de middleware por rol y rate limiting básico (pendiente de refinar en producción).

## Stack técnico

- **Framework**: Next.js 14 App Router + TypeScript.
- **Base de datos**: PostgreSQL + Prisma ORM.
- **UI**: TailwindCSS, shadcn/ui adaptado, lucide-react, recharts (preparado para visualizaciones adicionales).
- **Formularios**: react-hook-form + zod.
- **Tablas**: TanStack Table (infraestructura preparada para filtros/exports).
- **Uploads**: UploadThing (placeholders, configurar credenciales).
- **Email**: Resend (prod) / Nodemailer SMTP (dev).
- **Gráficas**: Recharts (implementado para métricas básicas, listo para expandirse).
- **Autenticación**: NextAuth con JWT + Magic Link.
- **Herramientas de calidad**: ESLint, Prettier, Husky, Vitest, Playwright (skip en entorno local sin despliegue).

## Estructura de carpetas

```
├── prisma/                # Esquema y seeds
├── src/
│   ├── app/               # App Router con rutas públicas y protegidas
│   ├── components/        # UI reutilizable y layouts
│   ├── lib/               # Utilidades (auth, prisma, csv, acciones)
│   └── styles/            # Estilos globales
├── tests/                 # Unit, integration y e2e (Playwright)
├── docker-compose.yml     # Stack local (Postgres + app)
└── README.md
```

## Requisitos previos

- Node.js 20+
- pnpm (Corepack recomendado)
- Docker (opcional para stack completo)
- Cuenta en Resend o SMTP disponible para emails
- Credenciales de UploadThing o Cloudinary si se habilitan uploads reales

## Configuración local

```bash
cp .env.example .env
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`.

### Docker Compose

```bash
docker compose up --build
```

Esto levanta PostgreSQL y la app Next.js con hot-reload (volumen montado).

## Scripts disponibles

| Script             | Descripción |
|--------------------|-------------|
| `pnpm dev`         | Ejecuta Next.js en modo desarrollo |
| `pnpm build`       | Compila la app para producción |
| `pnpm start`       | Sirve la app compilada |
| `pnpm lint`        | Corre ESLint |
| `pnpm format`      | Formatea con Prettier |
| `pnpm test`        | Ejecuta Playwright (skip en local sin despliegue) |
| `pnpm test:unit`   | Ejecuta Vitest |
| `pnpm db:generate` | Genera el cliente Prisma |
| `pnpm db:push`     | Sincroniza el esquema con la base |
| `pnpm db:seed`     | Ejecuta seeds de ejemplo |

## Variables de entorno

| Variable             | Descripción |
|----------------------|-------------|
| `DATABASE_URL`       | Cadena de conexión PostgreSQL |
| `NEXTAUTH_SECRET`    | Secreto para JWT NextAuth |
| `NEXTAUTH_URL`       | URL pública de la app |
| `RESEND_API_KEY`     | API key de Resend (opcional) |
| `RESEND_FROM`        | Remitente para emails |
| `SMTP_URL`           | Cadena SMTP alternativa (dev) |
| `UPLOADTHING_APP_ID` | Credenciales de UploadThing |
| `UPLOADTHING_SECRET` | Llave para UploadThing |
| `E2E_BASE_URL`       | URL base para pruebas Playwright |

## Base de datos y Prisma

1. Ajusta `DATABASE_URL` en `.env`.
2. Genera cliente: `pnpm db:generate`.
3. Aplica cambios: `pnpm db:push` (o `prisma migrate dev` según preferencia).
4. Seeds: `pnpm db:seed`.

### Seeds incluidos

- Superadmin: `admin@invitado.mx` / `Passw0rd!`
- 3 afiliados de ejemplo con redes y datos de contacto.
- 30 invitaciones (10 por afiliado) con diferentes fechas de expiración.
- 18 pedidos (6 por afiliado) en diversos estados.
- Recursos de marketing básicos.

## Calidad y pruebas

- `pnpm lint` y `pnpm format` deben pasar antes de cualquier merge (Husky + lint-staged).
- `pnpm test:unit` ejecuta pruebas de zod/utils.
- `pnpm test` ejecuta Playwright (por defecto marcado como `skip` hasta contar con entorno desplegado estable).
- Cobertura accesible en `coverage/` al correr Vitest con `--coverage` (configurado en `vitest.config.ts`).

## CI/CD

Se incluye workflow de GitHub Actions (`.github/workflows/ci.yml`) que:

1. Instala dependencias con pnpm.
2. Ejecuta `pnpm lint`.
3. Ejecuta `pnpm test:unit`.
4. Ejecuta `pnpm build`.
5. Verifica generación de Prisma (`pnpm db:generate`).

## Despliegue sugerido

### Vercel

1. Crear proyecto y conectar repositorio.
2. Configurar variables de entorno en Vercel (`DATABASE_URL`, `NEXTAUTH_*`, `RESEND_*`, etc.).
3. Configurar Postgres gestionado (p.ej. Supabase, Neon).
4. Ejecutar migraciones vía `pnpm db:push` (Deploy Hook o pipeline manual).
5. Configurar Resend o SMTP para emails salientes.
6. Ajustar dominio personalizado si aplica.

### Render / Fly.io

- Construir imagen Docker usando el `Dockerfile` provisto.
- Proveer base de datos Postgres gestionada y definir `DATABASE_URL`.
- Ejecutar `pnpm db:push` y `pnpm db:seed` durante el release.

## Project Board e Issues

Se recomienda crear un Project Board Kanban con las columnas **Backlog**, **En progreso**, **En revisión**, **Done**. Issues sugeridos:

1. `feature/auth`: Configuración completa de NextAuth + credenciales + magic link.
2. `feature/admin`: CRUD de afiliados, inventario y pedidos para superadmin.
3. `feature/affiliate`: Panel de afiliado con inventario, pedidos y recursos.
4. `feature/export`: Endpoints de exportación CSV y descargas.
5. `feature/notifications`: Emails transaccionales (alta de afiliado, cambio de estado, recordatorios de expiración).
6. `devops/ci`: Ajustes al pipeline de GitHub Actions y despliegues.

## Roadmap

- [ ] Integrar formularios editables (react-hook-form) para afiliados y pedidos.
- [ ] Añadir rate limiting sólido (Upstash/Redis) en rutas críticas.
- [ ] Conectar UploadThing o Cloudinary para carga de fotos.
- [ ] Añadir gráficas dinámicas con Recharts en dashboards.
- [ ] Completar pruebas E2E contra entorno desplegado.
- [ ] Documentar flujos de notificaciones y plantillas de correo.
- [ ] Grabar GIF de flujo principal e incrustarlo aquí.

---

> **Nota:** Este repositorio no incluye dependencias instaladas por restricciones del entorno. Ejecuta `pnpm install` para generar `pnpm-lock.yaml` y habilitar los scripts y workflows.
