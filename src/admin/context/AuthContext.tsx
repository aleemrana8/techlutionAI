import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import API from '../../api/api'

interface AuthState {
  token: string | null
  user: { id: string; name: string } | null
  isAuthenticated: boolean
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (adminId: string, password: string) => Promise<void>
  logout: () => void
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
    isAuthenticated: false,
    loading: true,
  })

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    setState({ token: null, user: null, isAuthenticated: false, loading: false })
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
          isAuthenticated: true,
          loading: false,
        })
      })
      .catch(() => {
        logout()
      })
  }, [logout])

  const login = async (adminId: string, password: string) => {
    const res = await API.post('/admin/login', { adminId, password })
    const { token, user } = res.data.data
    localStorage.setItem('admin_token', token)
    setState({ token, user, isAuthenticated: true, loading: false })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
