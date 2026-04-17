import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  delay?: number
  duration?: number
  scale?: number
  className?: string
}

export default function ScaleIn({ children, delay = 0, duration = 0.5, scale = 0.9, className = '' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
