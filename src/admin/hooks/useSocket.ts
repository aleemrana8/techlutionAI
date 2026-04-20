import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || ''

let socket: Socket | null = null

function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem('admin_token')
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: false,
    })
  }
  return socket
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const s = getSocket()
    socketRef.current = s

    if (!s.connected) {
      s.connect()
    }

    return () => {
      // Don't disconnect on unmount — shared instance
    }
  }, [])

  return socketRef.current
}

export type DashboardEvent =
  | 'lead:new'
  | 'lead:update'
  | 'client:new'
  | 'client:update'
  | 'project:update'
  | 'finance:new'
  | 'finance:update'
  | 'visitor:new'
  | 'employee:new'
  | 'employee:update'
  | 'dashboard:refresh'

export function useDashboardSocket(onEvent: (event: DashboardEvent, data: any) => void) {
  const callbackRef = useRef(onEvent)
  callbackRef.current = onEvent

  useEffect(() => {
    const s = getSocket()
    if (!s.connected) s.connect()

    const events: DashboardEvent[] = [
      'lead:new', 'lead:update', 'client:new', 'client:update',
      'project:update', 'finance:new', 'finance:update',
      'visitor:new', 'employee:new', 'employee:update', 'dashboard:refresh',
    ]

    const handler = (payload: any) => {
      callbackRef.current(payload?.event || 'dashboard:refresh', payload?.data)
    }

    events.forEach(e => s.on(e, handler))

    return () => {
      events.forEach(e => s.off(e, handler))
    }
  }, [])
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
