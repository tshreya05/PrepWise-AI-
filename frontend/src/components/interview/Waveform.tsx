import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WaveformProps {
  isActive: boolean
  className?: string
}

export default function Waveform({ isActive, className }: WaveformProps) {
  const bars = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className={cn('flex items-center justify-center gap-1 h-16', className)}>
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-primary to-accent"
          animate={
            isActive
              ? {
                  height: [8, 12 + Math.random() * 40, 8],
                  opacity: [0.5, 1, 0.5],
                }
              : { height: 8, opacity: 0.3 }
          }
          transition={{
            duration: 0.8 + Math.random() * 0.4,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  )
}
