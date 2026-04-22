import { Bell, Search, ChevronDown, Wifi, WifiOff, Sun, Moon, LogOut, Settings, User, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSocket, useDashboardSocket } from '../hooks/useSocket'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

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

export default function AdminHeader({ onMobileMenuToggle, mobileMenuOpen }: { onMobileMenuToggle?: () => void; mobileMenuOpen?: boolean }) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const socket = useSocket()
  const navigate = useNavigate()
  const [connected, setConnected] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState<{ id: number; text: string; time: Date }[]>([])
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!socket) return
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    setConnected(socket.connected)
    return () => { socket.off('connect', onConnect); socket.off('disconnect', onDisconnect) }
  }, [socket])

  // Listen for real-time events and add to notifications
  useDashboardSocket((event: any, _data: any) => {
    const messages: Record<string, string> = {
      'inquiry:new': '📥 New inquiry received',
      'visitor:new': '👁 New visitor detected',
      'client:new': '🤝 New client added',
      'project:update': '📋 Project updated',
      'finance:new': '💰 Finance record added',
      'employee:new': '👤 New employee added',
    }
    const msg = messages[event]
    if (msg) {
      setNotifications(prev => [{ id: Date.now(), text: msg, time: new Date() }, ...prev].slice(0, 20))
    }
  })

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const role = (user as any)?.role || 'ADMIN'
  const gradient = ROLE_COLORS[role] || ROLE_COLORS.ADMIN

  return (
    <header className="h-16 bg-slate-950/60 dark:bg-slate-950/60 bg-white/80 backdrop-blur-xl border-b border-white/[0.06] dark:border-white/[0.06] border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-300">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden w-9 h-9 rounded-xl bg-white/[0.04] dark:bg-white/[0.04] bg-slate-100 border border-white/[0.06] dark:border-white/[0.06] border-slate-200 flex items-center justify-center text-slate-400 hover:text-white dark:hover:text-white hover:text-slate-900 transition-all mr-2"
      >
        {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Search */}
      <div className="relative w-80 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-500 text-slate-400" />
        <input
          type="text"
          placeholder="Search anything…"
          className="w-full bg-white/[0.03] dark:bg-white/[0.03] bg-slate-100 border border-white/[0.06] dark:border-white/[0.06] border-slate-200 text-white dark:text-white text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2 placeholder-slate-600 dark:placeholder-slate-600 placeholder-slate-400 focus:outline-none focus:border-cyan-500/30 transition-all"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] dark:bg-white/[0.03] bg-slate-100 border border-white/[0.06] dark:border-white/[0.06] border-slate-200">
          {connected
            ? <><Wifi size={12} className="text-emerald-400" /><span className="text-[10px] text-emerald-400 font-medium">Live</span></>
            : <><WifiOff size={12} className="text-slate-500" /><span className="text-[10px] text-slate-500 font-medium">Offline</span></>
          }
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="relative w-9 h-9 rounded-xl bg-white/[0.04] dark:bg-white/[0.04] bg-slate-100 border border-white/[0.06] dark:border-white/[0.06] border-slate-200 flex items-center justify-center text-slate-400 hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-white/[0.08] dark:hover:bg-white/[0.08] hover:bg-slate-200 transition-all duration-300"
        >
          {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-violet-500" />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
            className="relative w-9 h-9 rounded-xl bg-white/[0.04] dark:bg-white/[0.04] bg-slate-100 border border-white/[0.06] dark:border-white/[0.06] border-slate-200 flex items-center justify-center text-slate-400 hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-white/[0.08] dark:hover:bg-white/[0.08] hover:bg-slate-200 transition-all"
          >
            <Bell size={16} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className={`absolute right-0 top-12 w-80 rounded-xl border shadow-2xl z-50 ${isDark ? 'bg-slate-900 border-white/[0.06]' : 'bg-white border-slate-200'}`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Notifications</span>
                {notifications.length > 0 && (
                  <button onClick={() => setNotifications([])} className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors">Clear all</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-8">No notifications yet</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`px-4 py-2.5 border-b last:border-0 ${isDark ? 'border-white/[0.04] hover:bg-white/[0.02]' : 'border-slate-100 hover:bg-slate-50'} transition-colors`}>
                      <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{n.text}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{n.time.toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] dark:bg-white/[0.04] bg-slate-100 border border-white/[0.06] dark:border-white/[0.06] border-slate-200 hover:bg-white/[0.08] dark:hover:bg-white/[0.08] hover:bg-slate-200 transition-all"
          >
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold`}>
              {(user?.name?.[0] ?? 'A').toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-sm text-white dark:text-white text-slate-900 font-medium block leading-tight">
                {user?.name ?? 'Admin'}
              </span>
              <span className="text-[10px] text-slate-500 leading-none">
                {ROLE_LABELS[role] || role}
              </span>
            </div>
            <ChevronDown size={14} className={`text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>
          {profileOpen && (
            <div className={`absolute right-0 top-12 w-48 rounded-xl border shadow-2xl z-50 py-1 ${isDark ? 'bg-slate-900 border-white/[0.06]' : 'bg-white border-slate-200'}`}>
              <button
                onClick={() => { navigate('/admin/settings'); setProfileOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs ${isDark ? 'text-slate-300 hover:bg-white/[0.04]' : 'text-slate-700 hover:bg-slate-50'} transition-colors`}
              >
                <User size={14} /> My Profile
              </button>
              <button
                onClick={() => { navigate('/admin/settings'); setProfileOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs ${isDark ? 'text-slate-300 hover:bg-white/[0.04]' : 'text-slate-700 hover:bg-slate-50'} transition-colors`}
              >
                <Settings size={14} /> Settings
              </button>
              <div className={`mx-3 my-1 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`} />
              <button
                onClick={() => { logout(); navigate('/admin/login', { replace: true }) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/5 transition-colors"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
