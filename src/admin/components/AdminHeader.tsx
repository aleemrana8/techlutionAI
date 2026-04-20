import { Bell, Search, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminHeader() {
  const { user } = useAuth()

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
        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] text-white font-bold flex items-center justify-center border-2 border-slate-950">
            3
          </span>
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
            {(user?.name?.[0] ?? 'A').toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm text-white font-medium leading-tight">
              {user?.name ?? 'Admin'}
            </span>
            {(user as any)?.role && (
              <span className="text-[10px] text-cyan-400 leading-tight">{(user as any).role}</span>
            )}
          </div>
          <ChevronDown size={14} className="text-slate-500" />
        </button>
      </div>
    </header>
  )
}
