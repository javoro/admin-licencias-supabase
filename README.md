# Administrador de Licencias

Aplicación de escritorio (Electron + React + Supabase) para gestionar las licencias de software de los proyectos.

![CI](https://github.com/javoro/admin-licencias-supabase/actions/workflows/ci.yml/badge.svg)

## Requisitos previos

- Node.js 20+
- Una cuenta y proyecto en [Supabase](https://supabase.com)

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/javoro/admin-licencias-supabase.git
cd admin-licencias-supabase

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase
```

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena los valores reales. **Nunca subas `.env.local` al repositorio.**

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase |

## Desarrollo

```bash
npm run dev
```

## Build

```bash
# Solo Vite (web)
npm run build

# Instalador de Windows (.exe)
npm run dist
```

## Seguridad

- Las credenciales de Supabase **nunca** se incluyen en el código fuente.
- La rama `main` está protegida: requiere PR y CI verde para hacer merge.
- Consulta [SECURITY.md](SECURITY.md) para reportar vulnerabilidades.

