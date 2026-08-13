import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function Card({ children, className, hover = false, onClick }: CardProps) {
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        onClick={onClick}
        className={cn(
          'glass rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300',
          className
        )}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}
