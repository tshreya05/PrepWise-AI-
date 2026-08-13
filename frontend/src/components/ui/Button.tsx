import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const variants = {
      primary:
        'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 border border-indigo-400/20',
      secondary:
        'glass text-slate-800 dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15',
      ghost:
        'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10',
      accent:
        'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/35 border border-cyan-400/20',
      danger:
        'bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30',
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-lg font-medium',
      md: 'text-sm px-5 py-2.5 rounded-xl font-medium',
      lg: 'text-base px-7 py-3.5 rounded-2xl font-semibold',
    }

    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        disabled={disabled}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          variants[variant],
          sizes[size],
          className
        )}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {children}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'
export default Button
