# Admin Licencias Supabase

Aplicación web para administrar las licencias de los proyectos. Permite crear aplicaciones, generar claves de licencia únicas para cada aplicación y gestionar su estado (activa, expirada, revocada).

## Características

- 📱 **Gestión de aplicaciones** – crea y elimina las aplicaciones que deseas licenciar.
- 🔑 **Generación de licencias** – genera claves únicas con formato `XXXX-XXXX-XXXX-XXXX-XXXXXXXX` automáticamente o escríbelas manualmente.
- 👤 **Datos del cliente** – asocia cada licencia a un nombre y correo electrónico.
- 📅 **Fecha de expiración** – establece una fecha de vencimiento opcional.
- 🔒 **Estados** – activa, expirada o revocada.
- 📋 **Copiar al portapapeles** – copia cualquier clave con un clic.

## Stack tecnológico

- **Frontend:** React 18 + TypeScript + Vite
- **Backend / Base de datos:** [Supabase](https://supabase.com)
- **Enrutamiento:** React Router 6

## Configuración

### 1. Clona el repositorio e instala dependencias

```bash
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env` y completa los valores de tu proyecto Supabase:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Base de datos

Ejecuta la migración en tu proyecto de Supabase (SQL Editor o Supabase CLI):

```bash
# Con Supabase CLI:
supabase db push

# O copia y ejecuta el contenido de:
# supabase/migrations/20240101000000_initial_schema.sql
```

### 4. Inicia la aplicación

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualiza el build |
| `npm run lint` | Linter ESLint |
