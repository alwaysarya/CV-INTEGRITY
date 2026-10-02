import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
}

export function AnimatedCounter({ value, duration = 1500, suffix = '', prefix = '', decimals = 0 }: Props) {
  const [display, setDisplay] = useState(0)
  const startTime = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    startTime.current = null
    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * easeOut)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplay(value)
      }
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return (
    <span className="count-up">
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  )
}
