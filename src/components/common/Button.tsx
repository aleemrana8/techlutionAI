import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 cursor-pointer relative overflow-hidden'

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50',
    secondary: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:shadow-lg hover:shadow-rose-500/50',
    outline: 'border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/60',
  }

  const glowMap = {
    primary: '0 0 25px rgba(139,92,246,0.4)',
    secondary: '0 0 25px rgba(244,63,94,0.4)',
    outline: '0 0 20px rgba(255,255,255,0.15)',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.06, boxShadow: glowMap[variant] }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className} group`}
      onClick={onClick}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
      {children}
    </motion.button>
  )
}
