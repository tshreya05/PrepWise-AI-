import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="space-y-2">
      {label && <label className="text-sm text-muted font-medium">{label}</label>}
      <input ref={ref} className={cn('input-field', error && 'border-red-500/50', className)} {...props} />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
export default Input
