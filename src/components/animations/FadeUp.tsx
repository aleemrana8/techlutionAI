import { motion } from 'framer-motion'
import { ReactNode } from 'react'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

interface Props {
  children: ReactNode
  delay?: number
  duration?: number
  y?: number
  className?: string
}

export default function FadeUp({ children, delay = 0, duration = 0.5, y = 40, className = '' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y, ...(isMobile ? {} : { filter: 'blur(4px)' }) }}
      whileInView={{ opacity: 1, y: 0, ...(isMobile ? {} : { filter: 'blur(0px)' }) }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
