import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TimerProps {
  isRunning: boolean
  className?: string
}

export default function Timer({ isRunning, className }: TimerProps) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isRunning])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div className={cn('font-mono text-2xl text-muted tabular-nums', className)}>
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  )
}
