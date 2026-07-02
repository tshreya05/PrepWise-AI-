import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div className={cn(hover ? 'glass-hover' : 'glass', 'p-6', className)}>
      {children}
    </div>
  )
}
