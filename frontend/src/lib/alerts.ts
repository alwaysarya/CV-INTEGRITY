/**
 * Security Alerts — Real-time notification system
 */

export type AlertType = 'info' | 'warning' | 'critical' | 'success'

export interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  timestamp: number
  read: boolean
  actionUrl?: string
  source: string
}

const STORAGE_KEY = 'cv_security_alerts'
const MAX_ALERTS = 50

function generateId(): string {
  return 'alert_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36)
}

export function getAllAlerts(): Alert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveAlerts(alerts: Alert[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts.slice(-MAX_ALERTS)))
  // Notify listeners
  window.dispatchEvent(new CustomEvent('cv_alerts_updated'))
}

export function createAlert(type: AlertType, title: string, message: string, options?: { actionUrl?: string; source?: string }): Alert {
  const alert: Alert = {
    id: generateId(),
    type,
    title,
    message,
    timestamp: Date.now(),
    read: false,
    actionUrl: options?.actionUrl,
    source: options?.source || 'system',
  }
  const alerts = getAllAlerts()
  alerts.push(alert)
  saveAlerts(alerts)
  return alert
}

export function markAsRead(id: string): void {
  const alerts = getAllAlerts()
  const idx = alerts.findIndex(a => a.id === id)
  if (idx === -1) return
  alerts[idx].read = true
  saveAlerts(alerts)
}

export function markAllAsRead(): void {
  const alerts = getAllAlerts()
  alerts.forEach(a => a.read = true)
  saveAlerts(alerts)
}

export function deleteAlert(id: string): void {
  const alerts = getAllAlerts().filter(a => a.id !== id)
  saveAlerts(alerts)
}

export function clearAllAlerts(): void {
  saveAlerts([])
}

export function getUnreadCount(): number {
  return getAllAlerts().filter(a => !a.read).length
}

export function getTypeColor(type: AlertType): string {
  const colors: Record<AlertType, string> = {
    info: '#5AC8FA',
    warning: '#FF9F0A',
    critical: '#FF453A',
    success: '#30D158',
  }
  return colors[type] || '#86868B'
}

export function formatAlertTime(ts: number): string {
  const diff = Date.now() - ts
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  if (sec < 60) return 'Just now'
  if (min < 60) return `${min}m ago`
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

/**
 * Seed some initial alerts for demo
 */
export function seedAlerts(): void {
  if (getAllAlerts().length > 0) return
  createAlert('info', 'Welcome to CV-Integrity', 'Your security dashboard is ready.', { source: 'system' })
  createAlert('success', '2FA enabled successfully', 'Your account is now protected with two-factor authentication.', { source: 'auth' })
}
