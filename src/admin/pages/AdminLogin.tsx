import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, User, Eye, EyeOff, Loader2, Shield, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate('/admin', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!adminId.trim() || !password.trim()) {
      setError('Please enter both Admin ID and Password')
      return
    }
    setLoading(true)
    try {
      await login(adminId, password)
      navigate('/admin', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Back to website */}
      <a
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors z-10 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Techlution AI
      </a>

      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] p-8 shadow-2xl shadow-black/40">
          {/* Gradient border glow */}
          <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-cyan-500/30 via-transparent to-violet-500/30 pointer-events-none" />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 blur-xl" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          </motion.div>

          <h1 className="text-2xl font-bold text-white text-center mb-1">Admin Portal</h1>
          <p className="text-slate-400 text-sm text-center mb-8">Techlution AI Management System</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Admin ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={adminId}
                  onChange={e => setAdminId(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-xl pl-10 pr-4 py-3 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10 transition-all"
                  placeholder="Enter your Admin ID"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-xl pl-10 pr-10 py-3 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10 transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {loading ? 'Authenticating…' : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-[10px] text-slate-600 mt-6">
            Secured by Techlution AI • Enterprise Portal
          </p>
        </div>
      </motion.div>
    </div>
  )
}
