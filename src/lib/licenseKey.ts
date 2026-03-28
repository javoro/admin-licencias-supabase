import { v4 as uuidv4 } from 'uuid'

/**
 * Generates a formatted license key in the pattern: XXXX-XXXX-XXXX-XXXX
 * derived from a UUID to ensure uniqueness.
 */
export function generateLicenseKey(): string {
  const raw = uuidv4().replace(/-/g, '').toUpperCase()
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 24)}`
}
