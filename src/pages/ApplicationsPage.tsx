import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ConfigBanner from '../components/ConfigBanner'
import type { Application } from '../types'

interface ApplicationFormData {
  name: string
  description: string
}

const emptyForm: ApplicationFormData = { name: '', description: '' }

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<ApplicationFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function fetchApplications() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setApplications(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchApplications() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('applications').insert({
      name: form.name.trim(),
      description: form.description.trim() || null,
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    setShowModal(false)
    setForm(emptyForm)
    fetchApplications()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta aplicación y todas sus licencias?')) return
    setDeleteId(id)
    const { error } = await supabase.from('applications').delete().eq('id', id)
    setDeleteId(null)
    if (error) setError(error.message)
    else setApplications(prev => prev.filter(a => a.id !== id))
  }

  return (
    <>
      <div className="page-header">
        <h2>Aplicaciones</h2>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(emptyForm) }}>
          + Nueva Aplicación
        </button>
      </div>

      <ConfigBanner />

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="loading">Cargando aplicaciones…</div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <p>No hay aplicaciones todavía.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Crear primera aplicación
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Fecha de creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td>
                      <Link
                        to={`/applications/${app.id}/licenses`}
                        style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        {app.name}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>
                      {app.description ?? '—'}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(app.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          to={`/applications/${app.id}/licenses`}
                          className="btn btn-ghost btn-sm"
                        >
                          Ver licencias
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(app.id)}
                          disabled={deleteId === app.id}
                        >
                          {deleteId === app.id ? '…' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Nueva Aplicación</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Mi Aplicación"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  placeholder="Descripción opcional de la aplicación"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : 'Crear Aplicación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
