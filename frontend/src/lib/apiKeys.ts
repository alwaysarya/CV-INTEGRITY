/**
 * API Keys Utility
 * Manage API keys for programmatic access
 */

export interface ApiKey {
  id: string
  name: string
  key: string       // full key (only shown once)
  prefix: string    // cv_live_sk_xxxx
  scopes: string[]
  createdAt: number
  lastUsedAt: number | null
  expiresAt: number | null
  status: 'active' | 'revoked' | 'expired'
  createdBy: string
}

const STORAGE_KEY = 'cv_integrity_api_keys'

function generateId(): string {
  return 'key_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

function generateKeyString(): string {
  const chars = 'abcdef0123456789'
  let s = ''
  for (let i = 0; i < 40; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return 'cv_live_sk_' + s
}

export function getAllKeys(): ApiKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const keys = JSON.parse(raw) as ApiKey[]
    // Auto-mark expired
    const now = Date.now()
    return keys.map(k => ({
      ...k,
      status: k.status === 'revoked' ? 'revoked' : (k.expiresAt && k.expiresAt < now ? 'expired' : 'active')
    }))
  } catch {
    return []
  }
}

export function createKey(name: string, scopes: string[], expiresInDays: number | null, createdBy: string): ApiKey {
  const keys = getAllKeys()
  const fullKey = generateKeyString()
  const newKey: ApiKey = {
    id: generateId(),
    name,
    key: fullKey,
    prefix: fullKey.slice(0, 20) + '...',
    scopes,
    createdAt: Date.now(),
    lastUsedAt: null,
    expiresAt: expiresInDays ? Date.now() + expiresInDays * 24 * 60 * 60 * 1000 : null,
    status: 'active',
    createdBy,
  }
  keys.push(newKey)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  return newKey
}

export function revokeKey(id: string): boolean {
  const keys = getAllKeys()
  const idx = keys.findIndex(k => k.id === id)
  if (idx === -1) return false
  keys[idx].status = 'revoked'
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  return true
}

export function deleteKey(id: string): boolean {
  const keys = getAllKeys()
  const filtered = keys.filter(k => k.id !== id)
  if (filtered.length === keys.length) return false
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export function touchKey(id: string): void {
  const keys = getAllKeys()
  const idx = keys.findIndex(k => k.id === id)
  if (idx === -1) return
  keys[idx].lastUsedAt = Date.now()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
}

export function formatRelative(ts: number | null): string {
  if (!ts) return 'Never'
  const diff = Date.now() - ts
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  if (sec < 60) return 'Just now'
  if (min < 60) return `${min} min ago`
  if (hr < 24) return `${hr} hr ago`
  return `${day} day${day > 1 ? 's' : ''} ago`
}

export function formatDate(ts: number | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
