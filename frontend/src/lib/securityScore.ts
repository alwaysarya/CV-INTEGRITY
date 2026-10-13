export interface SecurityCheck {
  id: string
  label: string
  description: string
  weight: number
  passed: boolean
  category: 'auth' | 'network' | 'data' | 'access'
}

export interface SecurityScore {
  score: number
  level: 'excellent' | 'good' | 'fair' | 'poor'
  label: string
  color: string
  passed: number
  total: number
  checks: SecurityCheck[]
}

export function computeSecurityScore(): SecurityScore {
  const checks: SecurityCheck[] = []

  const passwordHash = localStorage.getItem('cv_password_hash')
  checks.push({
    id: 'password', label: 'Password configured',
    description: 'A strong password is set for your account',
    weight: 15, passed: !!passwordHash, category: 'auth',
  })

  const twoFA = localStorage.getItem('cv_2fa_setup') === 'true'
  checks.push({
    id: '2fa', label: 'Two-factor authentication',
    description: '2FA adds an extra layer of security',
    weight: 25, passed: twoFA, category: 'auth',
  })

  let sessionTimeout = '30'
  try {
    const raw = localStorage.getItem('cv_integrity_security')
    if (raw) {
      const parsed = JSON.parse(raw)
      sessionTimeout = parsed.sessionTimeout || '30'
    }
  } catch {}
  checks.push({
    id: 'session-timeout', label: 'Session timeout configured',
    description: 'Auto logout after inactivity',
    weight: 10, passed: sessionTimeout !== '0', category: 'auth',
  })

  let sessions: any[] = []
  try {
    const raw = localStorage.getItem('cv_integrity_sessions')
    sessions = raw ? JSON.parse(raw) : []
  } catch {}
  checks.push({
    id: 'sessions', label: 'Sessions under control',
    description: 'Few active sessions across devices',
    weight: 10, passed: sessions.length <= 3, category: 'access',
  })

  let apiKeys: any[] = []
  try {
    const raw = localStorage.getItem('cv_integrity_api_keys')
    apiKeys = raw ? JSON.parse(raw) : []
  } catch {}
  const activeKeys = apiKeys.filter((k: any) => k.status === 'active')
  checks.push({
    id: 'api-keys', label: 'API keys have expiry',
    description: 'All active keys have expiration dates',
    weight: 10,
    passed: activeKeys.length === 0 || activeKeys.every((k: any) => k.expiresAt !== null),
    category: 'access',
  })

  let roles: any[] = []
  try {
    const raw = localStorage.getItem('cv_integrity_roles')
    roles = raw ? JSON.parse(raw) : []
  } catch {}
  checks.push({
    id: 'rbac', label: 'Role-based access control',
    description: 'Multiple roles configured for access control',
    weight: 15, passed: roles.length >= 3, category: 'access',
  })

  let ipSettings: any = { enabled: false }
  try {
    const raw = localStorage.getItem('cv_integrity_ip_settings')
    ipSettings = raw ? JSON.parse(raw) : { enabled: false }
  } catch {}
  let ipEntries: any[] = []
  try {
    const raw = localStorage.getItem('cv_integrity_ip_allowlist')
    ipEntries = raw ? JSON.parse(raw) : []
  } catch {}
  checks.push({
    id: 'ip-filter', label: 'IP filtering enabled',
    description: 'Network-level access control is active',
    weight: 15,
    passed: ipSettings.enabled && ipEntries.length > 0,
    category: 'network',
  })

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0)
  const earnedWeight = checks.filter(c => c.passed).reduce((sum, c) => sum + c.weight, 0)
  const score = Math.round((earnedWeight / totalWeight) * 100)

  let level: SecurityScore['level'] = 'poor'
  let label = 'Poor'
  let color = '#FF453A'
  if (score >= 85) { level = 'excellent'; label = 'Excellent'; color = '#30D158' }
  else if (score >= 70) { level = 'good'; label = 'Good'; color = '#0071E3' }
  else if (score >= 50) { level = 'fair'; label = 'Fair'; color = '#FF9F0A' }

  return {
    score, level, label, color,
    passed: checks.filter(c => c.passed).length,
    total: checks.length,
    checks,
  }
}

export const CATEGORY_INFO: Record<string, { label: string; color: string }> = {
  auth: { label: 'Authentication', color: '#0071E3' },
  access: { label: 'Access Control', color: '#AF52DE' },
  network: { label: 'Network Security', color: '#30D158' },
  data: { label: 'Data Protection', color: '#FF9F0A' },
}
