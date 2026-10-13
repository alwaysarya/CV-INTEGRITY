export interface IPEntry {
  id: string
  ip: string
  label: string
  type: 'allow' | 'block'
  createdAt: number
  createdBy: string
  active: boolean
}

const STORAGE_KEY = 'cv_integrity_ip_allowlist'
const SETTINGS_KEY = 'cv_integrity_ip_settings'

function generateId(): string {
  return 'ip_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

function isValidIPv4(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every(p => {
    const n = parseInt(p, 10)
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p
  })
}

export function validateIP(input: string): { valid: boolean; error?: string } {
  const trimmed = input.trim()
  if (!trimmed) return { valid: false, error: 'IP address is required' }
  if (trimmed.includes('/')) {
    const [ip, mask] = trimmed.split('/')
    const maskNum = parseInt(mask, 10)
    if (isNaN(maskNum) || maskNum < 0 || maskNum > 32) return { valid: false, error: 'Invalid CIDR mask (0-32)' }
    if (!isValidIPv4(ip)) return { valid: false, error: 'Invalid IP in CIDR' }
    return { valid: true }
  }
  if (isValidIPv4(trimmed)) return { valid: true }
  return { valid: false, error: 'Invalid IP format' }
}

export function getAllEntries(): IPEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as IPEntry[]
  } catch { return [] }
}

export function addEntry(ip: string, label: string, type: 'allow' | 'block', createdBy: string): IPEntry {
  const entries = getAllEntries()
  const newEntry: IPEntry = {
    id: generateId(),
    ip: ip.trim(),
    label: label.trim() || 'Untitled',
    type,
    createdAt: Date.now(),
    createdBy,
    active: true,
  }
  entries.push(newEntry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  return newEntry
}

export function removeEntry(id: string): boolean {
  const entries = getAllEntries()
  const filtered = entries.filter(e => e.id !== id)
  if (filtered.length === entries.length) return false
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export function toggleEntry(id: string): boolean {
  const entries = getAllEntries()
  const idx = entries.findIndex(e => e.id === id)
  if (idx === -1) return false
  entries[idx].active = !entries[idx].active
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  return true
}

export function getSettings(): { enabled: boolean; mode: 'allowlist' | 'blocklist' } {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { enabled: false, mode: 'allowlist' }
    return JSON.parse(raw)
  } catch { return { enabled: false, mode: 'allowlist' } }
}

export function saveSettings(settings: { enabled: boolean; mode: 'allowlist' | 'blocklist' }): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function getCurrentIP(): string {
  try {
    const sessionsRaw = localStorage.getItem('cv_integrity_sessions')
    if (sessionsRaw) {
      const sessions = JSON.parse(sessionsRaw)
      const current = sessions.find((s: any) => s.current)
      if (current?.ip) return current.ip
    }
  } catch {}
  return '127.0.0.1'
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
