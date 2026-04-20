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
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem('admin_token'),
    user: null,
    permissions: null,
    isAuthenticated: false,
    loading: true,
  })

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    setState({ token: null, user: null, permissions: null, isAuthenticated: false, loading: false })
    // Disconnect socket on logout
    import('../hooks/useSocket').then(m => m.disconnectSocket()).catch(() => {})
  }, [])

  // Verify stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      setState(s => ({ ...s, loading: false }))
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
