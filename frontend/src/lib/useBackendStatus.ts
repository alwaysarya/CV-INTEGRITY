import { useEffect, useState } from 'react'
import apiClient from '@/lib/api'

export function useBackendStatus(intervalMs: number = 10000) {
  const [online, setOnline] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await apiClient.getHealth()
        setOnline(res.data?.status === 'healthy')
        setLastCheck(new Date())
      } catch {
        setOnline(false)
        setLastCheck(new Date())
      }
    }
    check()
    const id = setInterval(check, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return { online, lastCheck }
}
