import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  confirmColor?: string
  variant?: 'danger' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ open, title, message, confirmText = 'Confirm', confirmColor, variant = 'danger', onConfirm, onCancel }: ConfirmModalProps) {
  const color = confirmColor || (variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-500 hover:bg-cyan-600')
  const Icon = variant === 'danger' ? AlertTriangle : CheckCircle2
  const iconColor = variant === 'danger' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onCancel}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border bg-slate-900 border-white/[0.08] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${iconColor}`}>
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">{message}</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl transition-all">Cancel</button>
              <button onClick={onConfirm} className={`px-4 py-2 text-sm text-white font-medium rounded-xl transition-all ${color}`}>{confirmText}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
