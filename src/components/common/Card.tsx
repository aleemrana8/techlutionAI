import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({
  children,
  className = '',
  hover = true,
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? {
        y: -10,
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(99,102,241,0.08)',
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      } : {}}
      transition={{ duration: 0.3 }}
      className={`glass p-6 md:p-8 rounded-2xl h-full transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  )
}
