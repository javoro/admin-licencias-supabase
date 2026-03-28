import { isConfigured } from '../lib/supabase'

export default function ConfigBanner() {
  if (isConfigured) return null
  return (
    <div
      style={{
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: 8,
        padding: '16px 20px',
        marginBottom: 24,
        color: '#92400e',
        fontSize: 14,
      }}
    >
      <strong>⚠️ Configuración requerida:</strong> Las variables de entorno{' '}
      <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> no están
      definidas. Copia <code>.env.example</code> a <code>.env</code> y completa los
      valores de tu proyecto de Supabase para que la aplicación funcione.
    </div>
  )
}
