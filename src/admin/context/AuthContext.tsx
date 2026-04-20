import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import API from '../../api/api'

interface AdminUser {
  id: string
  name: string
  username?: string
  email?: string
  role?: string
}

interface Permissions {
  dashboard?: boolean
  visitors?: { read: boolean; write: boolean }
  leads?: { read: boolean; write: boolean }
  clients?: { read: boolean; write: boolean }
  employees?: { read: boolean; write: boolean }
  finance?: { read: boolean; write: boolean }
  projects?: { read: boolean; write: boolean }
  analytics?: boolean
  logs?: boolean
  settings?: boolean
  adminUsers?: boolean
}

interface AuthState {
  token: string | null
  user: AdminUser | null
  permissions: Permissions | null
  isAuthenticated: boolean
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (resource: string, action?: 'read' | 'write') => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('admin_token')
    const savedUser = localStorage.getItem('admin_user')
    const savedPerms = localStorage.getItem('admin_permissions')
    // Restore session from localStorage immediately (no verify call needed)
    if (token && savedUser) {
      try {
        return {
          token,
          user: JSON.parse(savedUser),
          permissions: savedPerms ? JSON.parse(savedPerms) : null,
          isAuthenticated: true,
          loading: false,
        }
      } catch { /* corrupted storage — fall through */ }
    }
    return { token, user: null, permissions: null, isAuthenticated: false, loading: !token ? false : true }
  })

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_permissions')
    setState({ token: null, user: null, permissions: null, isAuthenticated: false, loading: false })
    // Disconnect socket on logout
    import('../hooks/useSocket').then(m => m.disconnectSocket()).catch(() => {})
  }, [])

  // Verify stored token on mount (only if not already restored from cache)
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      setState(s => ({ ...s, loading: false }))
      return
    }
    // If already authenticated from localStorage, just background-verify
    if (state.isAuthenticated && state.user) {
      // Silent background verify — don't block UI
      API.get('/admin/verify', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const user = res.data.data?.user ?? state.user
          const permissions = res.data.data?.permissions ?? state.permissions
          localStorage.setItem('admin_user', JSON.stringify(user))
          if (permissions) localStorage.setItem('admin_permissions', JSON.stringify(permissions))
          setState(s => ({ ...s, user, permissions }))
        })
        .catch(() => {
          // Token expired on server — force logout
          logout()
        })
      return
    }
    API.get('/admin/verify', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setState({
          token,
          user: res.data.data?.user ?? { id: 'admin', name: 'Administrator' },
          permissions: res.data.data?.permissions ?? null,
          isAuthenticated: true,
          loading: false,
        })
      })
      .catch(() => {
        logout()
      })
  }, [logout])

  const login = async (username: string, password: string) => {
    // Try RBAC DB login first, then fallback to env-based login
    let res: any
    try {
      res = await API.post('/admin/login', { username, password })
    } catch {
      // Fallback: env-based login (for backward compatibility)
      res = await API.post('/admin/env-login', { adminId: username, password })
    }
    const { token, user, permissions } = res.data.data
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_user', JSON.stringify(user))
    if (permissions) localStorage.setItem('admin_permissions', JSON.stringify(permissions))
    setState({ token, user, permissions: permissions ?? null, isAuthenticated: true, loading: false })
  }

  const hasPermission = (resource: string, action?: 'read' | 'write'): boolean => {
    if (!state.permissions) return true // Fallback: allow all for env-based admin
    const perm = (state.permissions as any)[resource]
    if (perm === undefined) return false
    if (typeof perm === 'boolean') return perm
    if (action) return perm[action] ?? false
    return perm.read || perm.write
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}
