export interface Application {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface License {
  id: string
  application_id: string
  license_key: string
  customer_name: string
  customer_email: string | null
  status: 'active' | 'expired' | 'revoked'
  expires_at: string | null
  created_at: string
  updated_at: string
  application?: Application
}

export type LicenseStatus = License['status']
