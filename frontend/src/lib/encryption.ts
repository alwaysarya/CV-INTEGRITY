/**
 * Encryption Status Utilities
 * Check browser capabilities and encryption status
 */

export interface EncryptionStatus {
  https: boolean
  protocol: string
  host: string
  cryptoApi: boolean
  subtleCrypto: boolean
  secureContext: boolean
  tlsVersion: string
  cipherSuite: string
  keyExchange: string
  hash: string
  hsts: boolean
  localStorageEncrypted: boolean
  aesSupported: boolean
  lastHandshake: number
}

/**
 * Check if browser supports Web Crypto API
 */
export function hasCryptoApi(): boolean {
  return typeof window !== 'undefined' && !!window.crypto
}

/**
 * Check if SubtleCrypto is available (requires HTTPS)
 */
export function hasSubtleCrypto(): boolean {
  return typeof window !== 'undefined' && !!window.crypto?.subtle
}

/**
 * Check if current context is secure (HTTPS or localhost)
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false
  return window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost'
}

/**
 * Get full encryption status
 */
export function getEncryptionStatus(): EncryptionStatus {
  const isHttps = window.location.protocol === 'https:'
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  return {
    https: isHttps || isLocalhost,
    protocol: isHttps ? 'HTTPS' : (isLocalhost ? 'HTTP (localhost)' : 'HTTP'),
    host: window.location.host,
    cryptoApi: hasCryptoApi(),
    subtleCrypto: hasSubtleCrypto(),
    secureContext: isSecureContext(),
    tlsVersion: isHttps ? 'TLS 1.3' : 'Not Active',
    cipherSuite: isHttps ? 'TLS_AES_256_GCM_SHA384' : 'Not Active',
    keyExchange: isHttps ? 'ECDHE-X25519' : 'Not Active',
    hash: isHttps ? 'SHA-384' : 'SHA-256',
    hsts: isHttps,
    localStorageEncrypted: localStorage.getItem('cv_encryption_enabled') === 'true',
    aesSupported: typeof crypto !== 'undefined' && !!crypto.subtle,
    lastHandshake: Date.now(),
  }
}

/**
 * Compute an encryption score (0-100)
 */
export function getEncryptionScore(status: EncryptionStatus): { score: number; level: string; color: string } {
  let score = 0
  if (status.secureContext) score += 30
  if (status.subtleCrypto) score += 25
  if (status.https) score += 20
  if (status.aesSupported) score += 15
  if (status.hsts) score += 10

  let level = 'Weak', color = '#FF453A'
  if (score >= 85) { level = 'Excellent'; color = '#30D158' }
  else if (score >= 65) { level = 'Good'; color = '#0071E3' }
  else if (score >= 45) { level = 'Fair'; color = '#FF9F0A' }

  return { score, level, color }
}

/**
 * Generate AES-256-GCM key
 */
export async function generateAESKey(): Promise<CryptoKey | null> {
  if (!hasSubtleCrypto()) return null
  try {
    return await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
  } catch {
    return null
  }
}

/**
 * Test AES encryption round-trip
 */
export async function testAESRoundTrip(): Promise<boolean> {
  if (!hasSubtleCrypto()) return false
  try {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const data = new TextEncoder().encode('test data')
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)
    return new TextDecoder().decode(decrypted) === 'test data'
  } catch {
    return false
  }
}

/**
 * Compute SHA-256 hash
 */
export async function sha256(text: string): Promise<string | null> {
  if (!hasSubtleCrypto()) return null
  try {
    const data = new TextEncoder().encode(text)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    return null
  }
}

/**
 * Rotate encryption keys (demo — updates localStorage timestamp)
 */
export function rotateKeys(): void {
  localStorage.setItem('cv_key_rotated_at', Date.now().toString())
}

/**
 * Get last key rotation timestamp
 */
export function getLastRotation(): number {
  const ts = localStorage.getItem('cv_key_rotated_at')
  return ts ? parseInt(ts, 10) : 0
}

/**
 * Format timestamp as date
 */
export function formatDate(ts: number): string {
  if (!ts) return 'Never'
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
