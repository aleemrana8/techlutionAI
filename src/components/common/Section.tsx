import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SectionProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  id?: string
}

export default function Section({
  children,
  className = '',
  title,
  subtitle,
  id,
}: SectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: '-80px' }}
      className={`py-20 md:py-32 px-4 md:px-8 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="gradient-text mb-4">{title}</h2>
            {subtitle && <p className="text-xl text-gray-300 max-w-2xl mx-auto">{subtitle}</p>}
          </motion.div>
        )}
        {children}
      </div>
    </motion.section>
  )
}
