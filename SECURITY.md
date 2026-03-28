# Política de seguridad

## Reportar una vulnerabilidad

Si encuentras una vulnerabilidad de seguridad en este proyecto, **no la publiques como issue público**. En cambio, contáctame directamente a través de GitHub.

## Variables de entorno

Este proyecto requiere las siguientes variables de entorno para funcionar. **Nunca** deben commitearse valores reales al repositorio:

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase |

Copia `.env.example` a `.env.local` y rellena los valores reales.

## Supabase Row Level Security (RLS)

Asegúrate de tener habilitado **Row Level Security** en todas las tablas de Supabase y de que solo usuarios autenticados puedan acceder a los datos de licencias.
