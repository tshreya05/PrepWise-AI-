import React from 'react'
import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -6 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 24,
        mass: 0.8,
      }}
      className={`w-full h-full ${className}`}
    >
      {children}
    </motion.div>
  )
}
