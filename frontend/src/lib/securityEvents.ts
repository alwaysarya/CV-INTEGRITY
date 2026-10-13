/**
 * Security Events — real-time event tracking
 */

export type EventType = 'login' | 'logout' | 'failed' | 'lockout' | 'session_revoke' | 'api_key_created' | 'api_key_revoked' | 'password_changed' | '2fa_enabled' | 'ip_added' | 'ip_removed'

export interface SecurityEvent {
  id: string
  type: EventType
  username: string
  ip: string
  location: string
  lat: number
  lng: number
  userAgent: string
  timestamp: number
  severity: 'info' | 'warning' | 'critical' | 'success'
}

const STORAGE_KEY = 'cv_security_events'
const MAX_EVENTS = 100

// Demo locations with lat/lng
const LOCATIONS = [
  { city: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
  { city: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946 },
  { city: 'Chennai', country: 'India', lat: 13.0827, lng: 80.2707 },
  { city: 'Kolkata', country: 'India', lat: 22.5726, lng: 88.3639 },
  { city: 'Hyderabad', country: 'India', lat: 17.3850, lng: 78.4867 },
  { city: 'Pune', country: 'India', lat: 18.5204, lng: 73.8567 },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
]

function generateId(): string {
  return 'evt_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36)
}

function randomIP(): string {
  return `${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

export function getSeverity(type: EventType): SecurityEvent['severity'] {
  switch (type) {
    case 'login': case 'logout': case 'password_changed': case '2fa_enabled': return 'success'
    case 'session_revoke': case 'api_key_created': case 'api_key_revoked': case 'ip_added': case 'ip_removed': return 'info'
    case 'failed': return 'warning'
    case 'lockout': return 'critical'
    default: return 'info'
  }
}

export function getTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    login: 'Sign in',
    logout: 'Sign out',
    failed: 'Failed attempt',
    lockout: 'Account locked',
    session_revoke: 'Session revoked',
    api_key_created: 'API key created',
    api_key_revoked: 'API key revoked',
    password_changed: 'Password changed',
    '2fa_enabled': '2FA enabled',
    ip_added: 'IP added',
    ip_removed: 'IP removed',
  }
  return labels[type] || type
}

export function getEventColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    login: '#30D158',
    logout: '#5AC8FA',
    failed: '#FF9F0A',
    lockout: '#FF453A',
    session_revoke: '#5E5CE6',
    api_key_created: '#AF52DE',
    api_key_revoked: '#FF9F0A',
    password_changed: '#30D158',
    '2fa_enabled': '#30D158',
    ip_added: '#2DD4BF',
    ip_removed: '#FF453A',
  }
  return colors[type] || '#86868B'
}

export function getAllEvents(): SecurityEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedEvents()
    return JSON.parse(raw)
  } catch {
    return seedEvents()
  }
}

function saveEvents(events: SecurityEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
}

/**
 * Add a new event
 */
export function addEvent(type: EventType, username: string, options?: { ip?: string; location?: string }): SecurityEvent {
  const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
  const event: SecurityEvent = {
    id: generateId(),
    type,
    username,
    ip: options?.ip || randomIP(),
    location: `${loc.city}, ${loc.country}`,
    lat: loc.lat,
    lng: loc.lng,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    severity: getSeverity(type),
  }
  const events = getAllEvents()
  events.push(event)
  saveEvents(events)
  return event
}

/**
 * Generate random event (for simulation)
 */
export function generateRandomEvent(): SecurityEvent {
  const types: EventType[] = ['login', 'logout', 'failed', 'session_revoke', 'api_key_created']
  const usernames = ['analyst', 'auditor', 'admin', 'guest']
  const type = types[Math.floor(Math.random() * types.length)]
  const username = usernames[Math.floor(Math.random() * usernames.length)]
  return addEvent(type, username)
}

/**
 * Seed initial events if none exist
 */
function seedEvents(): SecurityEvent[] {
  const types: EventType[] = ['login', 'logout', 'failed', 'session_revoke', 'api_key_created', 'password_changed']
  const usernames = ['analyst', 'auditor', 'admin']
  const events: SecurityEvent[] = []
  const now = Date.now()
  for (let i = 0; i < 15; i++) {
    const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    events.push({
      id: generateId(),
      type,
      username: usernames[Math.floor(Math.random() * usernames.length)],
      ip: randomIP(),
      location: `${loc.city}, ${loc.country}`,
      lat: loc.lat,
      lng: loc.lng,
      userAgent: navigator.userAgent,
      timestamp: now - (15 - i) * 60000,
      severity: getSeverity(type),
    })
  }
  saveEvents(events)
  return events
}

/**
 * Clear all events
 */
export function clearEvents(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Format relative time
 */
export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  if (sec < 60) return 'Just now'
  if (min < 60) return `${min}m ago`
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}
