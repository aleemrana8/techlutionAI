import { Bell, Search, ChevronDown, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../hooks/useSocket'
import { useState, useEffect } from 'react'

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  HR: 'HR Manager',
  FINANCE: 'Finance',
  MANAGER: 'Manager',
  SUPPORT: 'Support',
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'from-cyan-500 to-violet-500',
  ADMIN: 'from-cyan-500 to-blue-500',
  HR: 'from-emerald-500 to-teal-500',
  FINANCE: 'from-amber-500 to-orange-500',
  MANAGER: 'from-violet-500 to-purple-500',
  SUPPORT: 'from-slate-400 to-slate-500',
}

export default function AdminHeader() {
  const { user } = useAuth()
  const socket = useSocket()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!socket) return
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    setConnected(socket.connected)
    return () => { socket.off('connect', onConnect); socket.off('disconnect', onDisconnect) }
  }, [socket])

  const role = (user as any)?.role || 'ADMIN'
  const gradient = ROLE_COLORS[role] || ROLE_COLORS.ADMIN

  return (
    <header className="h-16 bg-slate-950/60 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="relative w-80 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search anything…"
          className="w-full bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
          {connected
            ? <><Wifi size={12} className="text-emerald-400" /><span className="text-[10px] text-emerald-400 font-medium">Live</span></>
            : <><WifiOff size={12} className="text-slate-500" /><span className="text-[10px] text-slate-500 font-medium">Offline</span></>
          }
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all">
          <Bell size={16} />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold`}>
            {(user?.name?.[0] ?? 'A').toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-sm text-white font-medium block leading-tight">
              {user?.name ?? 'Admin'}
            </span>
            <span className="text-[10px] text-slate-500 leading-none">
              {ROLE_LABELS[role] || role}
            </span>
          </div>
          <ChevronDown size={14} className="text-slate-500" />
        </button>
      </div>
    </header>
  )
}
