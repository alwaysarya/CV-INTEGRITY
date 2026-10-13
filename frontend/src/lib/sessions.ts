/**
 * Session Management Utility
 * 
 * Handles user sessions for the CV-Integrity platform.
 * Stores sessions in localStorage (demo mode).
 * In production, this should sync with backend.
 */

export interface Session {
  id: string
  userId: string
  username: string
  device: string
  browser: string
  os: string
  ip: string
  location: string
  userAgent: string
  createdAt: number
  lastActiveAt: number
  current: boolean
}

const SESSIONS_KEY = 'cv_integrity_sessions'
const CURRENT_SESSION_KEY = 'cv_integrity_current_session'

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

/**
 * Detect browser from user agent
 */
function detectBrowser(ua: string): string {
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('Chrome/')) return 'Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Opera/') || ua.includes('OPR/')) return 'Opera'
  return 'Unknown Browser'
}

/**
 * Detect OS from user agent
 */
function detectOS(ua: string): string {
  if (ua.includes('Mac OS X')) return 'macOS'
  if (ua.includes('Windows NT')) return 'Windows'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  return 'Unknown OS'
}

/**
 * Detect device type from user agent
 */
function detectDevice(ua: string): string {
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return 'Tablet'
  if (/Mobile|Android|iPhone|iPod/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

/**
 * Get a random location (demo)
 */
function randomLocation(): string {
  const locations = [
    'New Delhi, India',
    'Mumbai, India',
    'Bangalore, India',
    'Hyderabad, India',
    'Pune, India',
    'Chennai, India',
  ]
  return locations[Math.floor(Math.random() * locations.length)]
}

/**
 * Get a random IP (demo)
 */
function randomIP(): string {
  return `${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

/**
 * Create a new session on login
 */
export function createSession(username: string, userId: string = username): Session {
  const ua = navigator.userAgent
  const sessions = getAllSessions()

  // Mark all existing as not current
  sessions.forEach(s => s.current = false)

  const newSession: Session = {
    id: generateSessionId(),
    userId,
    username,
    device: detectDevice(ua),
    browser: detectBrowser(ua),
    os: detectOS(ua),
    ip: randomIP(),
    location: randomLocation(),
    userAgent: ua,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    current: true,
  }

  sessions.push(newSession)
  saveSessions(sessions)
  localStorage.setItem(CURRENT_SESSION_KEY, newSession.id)

  return newSession
}

/**
 * Get all sessions
 */
export function getAllSessions(): Session[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Session[]
  } catch {
    return []
  }
}

/**
 * Get the current session
 */
export function getCurrentSession(): Session | null {
  const currentId = localStorage.getItem(CURRENT_SESSION_KEY)
  if (!currentId) return null
  const sessions = getAllSessions()
  return sessions.find(s => s.id === currentId) || null
}

/**
 * Update session's last active timestamp
 */
export function touchCurrentSession(): void {
  const currentId = localStorage.getItem(CURRENT_SESSION_KEY)
  if (!currentId) return
  const sessions = getAllSessions()
  const idx = sessions.findIndex(s => s.id === currentId)
  if (idx !== -1) {
    sessions[idx].lastActiveAt = Date.now()
    saveSessions(sessions)
  }
}

/**
 * Revoke (logout) a specific session
 */
export function revokeSession(sessionId: string): boolean {
  const sessions = getAllSessions()
  const session = sessions.find(s => s.id === sessionId)

  // Can't revoke current session via this function
  if (session?.current) return false

  const filtered = sessions.filter(s => s.id !== sessionId)
  saveSessions(filtered)
  return true
}

/**
 * Revoke all sessions except current
 */
export function revokeAllOtherSessions(): number {
  const sessions = getAllSessions()
  const current = sessions.find(s => s.current)
  if (!current) return 0

  const before = sessions.length
  saveSessions([current])
  return before - 1
}

/**
 * Clear all sessions on logout
 */
export function clearAllSessions(): void {
  localStorage.removeItem(SESSIONS_KEY)
  localStorage.removeItem(CURRENT_SESSION_KEY)
}

/**
 * Save sessions to localStorage
 */
function saveSessions(sessions: Session[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

/**
 * Format relative time (e.g., "2 min ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)

  if (sec < 60) return 'Just now'
  if (min < 60) return `${min} min ago`
  if (hr < 24) return `${hr} hr ago`
  return `${day} day${day > 1 ? 's' : ''} ago`
}

/**
 * Format absolute time
 */
export function formatAbsoluteTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
