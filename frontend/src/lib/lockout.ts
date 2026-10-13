/**
 * Account Lockout Utility
 * Brute force protection — tracks failed login attempts
 */

export interface LockoutState {
  username: string
  failedAttempts: number
  lockedUntil: number | null
  lastAttemptAt: number
}

const STORAGE_KEY = 'cv_integrity_lockout'
const POLICY_KEY = 'cv_integrity_lockout_policy'

export interface LockoutPolicy {
  maxAttempts: number
  lockDurationMin: number
}

const DEFAULT_POLICY: LockoutPolicy = {
  maxAttempts: 5,
  lockDurationMin: 15,
}

export function getPolicy(): LockoutPolicy {
  try {
    const raw = localStorage.getItem(POLICY_KEY)
    if (!raw) return DEFAULT_POLICY
    return JSON.parse(raw)
  } catch {
    return DEFAULT_POLICY
  }
}

export function savePolicy(policy: LockoutPolicy): void {
  localStorage.setItem(POLICY_KEY, JSON.stringify(policy))
}

function getAllStates(): Record<string, LockoutState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveStates(states: Record<string, LockoutState>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states))
}

export function getState(username: string): LockoutState | null {
  const states = getAllStates()
  return states[username] || null
}

export interface LockoutCheck {
  locked: boolean
  remainingMs: number
  attemptsLeft: number
  failedAttempts: number
}

export function checkLockout(username: string): LockoutCheck {
  const state = getState(username)
  const policy = getPolicy()

  if (!state) {
    return {
      locked: false,
      remainingMs: 0,
      attemptsLeft: policy.maxAttempts,
      failedAttempts: 0,
    }
  }

  // Check if lock expired
  if (state.lockedUntil && state.lockedUntil > Date.now()) {
    return {
      locked: true,
      remainingMs: state.lockedUntil - Date.now(),
      attemptsLeft: 0,
      failedAttempts: state.failedAttempts,
    }
  }

  // Lock expired → clear it
  if (state.lockedUntil && state.lockedUntil <= Date.now()) {
    const states = getAllStates()
    states[username] = {
      ...state,
      failedAttempts: 0,
      lockedUntil: null,
    }
    saveStates(states)
    return {
      locked: false,
      remainingMs: 0,
      attemptsLeft: policy.maxAttempts,
      failedAttempts: 0,
    }
  }

  return {
    locked: false,
    remainingMs: 0,
    attemptsLeft: policy.maxAttempts - state.failedAttempts,
    failedAttempts: state.failedAttempts,
  }
}

export interface RecordResult {
  locked: boolean
  attemptsLeft: number
  failedAttempts: number
  lockedUntil: number | null
}

export function recordFailure(username: string): RecordResult {
  const policy = getPolicy()
  const states = getAllStates()
  const existing = states[username] || {
    username,
    failedAttempts: 0,
    lockedUntil: null,
    lastAttemptAt: Date.now(),
  }

  const failedAttempts = existing.failedAttempts + 1
  const shouldLock = failedAttempts >= policy.maxAttempts
  const lockedUntil = shouldLock ? Date.now() + policy.lockDurationMin * 60 * 1000 : null

  states[username] = {
    username,
    failedAttempts: shouldLock ? 0 : failedAttempts,  // Reset counter on lock
    lockedUntil,
    lastAttemptAt: Date.now(),
  }
  saveStates(states)

  return {
    locked: shouldLock,
    attemptsLeft: shouldLock ? 0 : policy.maxAttempts - failedAttempts,
    failedAttempts,
    lockedUntil,
  }
}

export function recordSuccess(username: string): void {
  const states = getAllStates()
  delete states[username]
  saveStates(states)
}

export function unlockAccount(username: string): void {
  const states = getAllStates()
  delete states[username]
  saveStates(states)
}

export function getAllLockedAccounts(): LockoutState[] {
  const states = getAllStates()
  return Object.values(states).filter(s => s.lockedUntil && s.lockedUntil > Date.now())
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}
