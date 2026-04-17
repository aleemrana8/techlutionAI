import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'

interface ToastProps {
  show: boolean
  onClose: () => void
  title?: string
  message?: string
  duration?: number
}

export default function Toast({ show, onClose, title = 'Message Sent!', message = 'Thank you for contacting us. We will respond within 24 hours.', duration = 6000 }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [show, onClose, duration])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -40, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -40, x: '-50%' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-6 left-1/2 z-[200] w-[90vw] max-w-md"
        >
          <div className="relative rounded-2xl border border-emerald-500/20 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-12 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-4 p-5">
              {/* Icon */}
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/25 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-emerald-400" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white mb-0.5">{title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className="h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
