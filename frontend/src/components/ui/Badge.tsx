import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variantStyles = {
    primary: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    accent: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
    success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20',
    neutral: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20',
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border backdrop-blur-md transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  )
}
