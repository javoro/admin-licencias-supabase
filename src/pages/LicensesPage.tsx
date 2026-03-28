import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { generateLicenseKey } from '../lib/licenseKey'
import type { Application, License, LicenseStatus } from '../types'

interface LicenseFormData {
  customer_name: string
  customer_email: string
  expires_at: string
  license_key: string
}

function emptyForm(): LicenseFormData {
  return {
    customer_name: '',
    customer_email: '',
    expires_at: '',
    license_key: generateLicenseKey(),
  }
}

const STATUS_LABELS: Record<LicenseStatus, string> = {
  active: 'Activa',
  expired: 'Expirada',
  revoked: 'Revocada',
}

export default function LicensesPage() {
  const { id: applicationId } = useParams<{ id: string }>()
  const [application, setApplication] = useState<Application | null>(null)
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<LicenseFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!applicationId) return
    setLoading(true)
    setError(null)

    const [appRes, licRes] = await Promise.all([
      supabase.from('applications').select('*').eq('id', applicationId).single(),
      supabase
        .from('licenses')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false }),
    ])

    if (appRes.error) setError(appRes.error.message)
    else setApplication(appRes.data)

    if (licRes.error) setError(licRes.error.message)
    else setLicenses(licRes.data ?? [])

    setLoading(false)
  }, [applicationId])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('licenses').insert({
      application_id: applicationId,
      license_key: form.license_key.trim(),
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim() || null,
      expires_at: form.expires_at || null,
      status: 'active',
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    setShowModal(false)
    setForm(emptyForm())
    fetchData()
  }

  async function handleRevoke(licenseId: string) {
    if (!confirm('¿Revocar esta licencia? No podrá ser reactivada.')) return
    const { error } = await supabase
      .from('licenses')
      .update({ status: 'revoked' })
      .eq('id', licenseId)
    if (error) setError(error.message)
    else setLicenses(prev => prev.map(l => l.id === licenseId ? { ...l, status: 'revoked' } : l))
  }

  async function handleDelete(licenseId: string) {
    if (!confirm('¿Eliminar esta licencia permanentemente?')) return
    const { error } = await supabase.from('licenses').delete().eq('id', licenseId)
    if (error) setError(error.message)
    else setLicenses(prev => prev.filter(l => l.id !== licenseId))
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function openCreateModal() {
    setForm(emptyForm())
    setShowModal(true)
  }

  if (loading) return <div className="loading">Cargando…</div>

  const counts = {
    total: licenses.length,
    active: licenses.filter(l => l.status === 'active').length,
    expired: licenses.filter(l => l.status === 'expired').length,
    revoked: licenses.filter(l => l.status === 'revoked').length,
  }

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/applications">Aplicaciones</Link>
        <span>›</span>
        <span>{application?.name ?? '…'}</span>
        <span>›</span>
        <span>Licencias</span>
      </nav>

      <div className="page-header">
        <div>
          <h2>{application?.name}</h2>
          {application?.description && (
            <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>{application.description}</p>
          )}
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Nueva Licencia
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{counts.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{counts.active}</div>
          <div className="stat-label">Activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{counts.expired}</div>
          <div className="stat-label">Expiradas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{counts.revoked}</div>
          <div className="stat-label">Revocadas</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {licenses.length === 0 ? (
          <div className="empty-state">
            <p>No hay licencias para esta aplicación.</p>
            <button className="btn btn-primary" onClick={openCreateModal}>
              Crear primera licencia
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Clave de licencia</th>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Expira</th>
                  <th>Creada</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map(lic => (
                  <tr key={lic.id}>
                    <td>
                      <span className="license-key">{lic.license_key}</span>
                      <button
                        className="copy-btn"
                        title="Copiar clave"
                        onClick={() => copyToClipboard(lic.license_key, lic.id)}
                      >
                        {copied === lic.id ? '✓' : '⧉'}
                      </button>
                    </td>
                    <td>{lic.customer_name}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{lic.customer_email ?? '—'}</td>
                    <td>
                      <span className={`badge badge-${lic.status}`}>
                        {STATUS_LABELS[lic.status]}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {lic.expires_at
                        ? new Date(lic.expires_at).toLocaleDateString('es-ES')
                        : 'Sin vencimiento'}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(lic.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {lic.status === 'active' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleRevoke(lic.id)}
                          >
                            Revocar
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(lic.id)}
                        >
                          Eliminar
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
            <h3>Nueva Licencia – {application?.name}</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Clave de licencia *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    value={form.license_key}
                    onChange={e => setForm(f => ({ ...f, license_key: e.target.value }))}
                    style={{ flex: 1, fontFamily: 'monospace' }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    title="Generar nueva clave"
                    onClick={() => setForm(f => ({ ...f, license_key: generateLicenseKey() }))}
                  >
                    ↺
                  </button>
                </div>
                <span className="hint">Se genera automáticamente. Puedes regenerarla o editarla.</span>
              </div>
              <div className="form-group">
                <label>Nombre del cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Empresa o persona"
                  value={form.customer_name}
                  onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Email del cliente</label>
                <input
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={form.customer_email}
                  onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Fecha de expiración</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                />
                <span className="hint">Deja vacío para una licencia sin vencimiento.</span>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : 'Crear Licencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
