import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

type DashboardEvent =
  | 'lead:new' | 'lead:update'
  | 'client:new' | 'client:update'
  | 'project:update'
  | 'finance:new' | 'finance:update'
  | 'visitor:new'
  | 'employee:new' | 'employee:update'
  | 'dashboard:refresh'

type EventHandler = (data: any) => void

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : window.location.origin

/**
 * Hook that connects to the Socket.IO server for real-time admin dashboard updates.
 * Returns a `subscribe` function to listen for specific events.
 */
export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map())

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    })

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })

    // Forward all dashboard events to registered handlers
    const events: DashboardEvent[] = [
      'lead:new', 'lead:update',
      'client:new', 'client:update',
      'project:update',
      'finance:new', 'finance:update',
      'visitor:new',
      'employee:new', 'employee:update',
      'dashboard:refresh',
    ]

    events.forEach(event => {
      socket.on(event, (payload: any) => {
        const handlers = handlersRef.current.get(event)
        if (handlers) {
          handlers.forEach(fn => fn(payload?.data ?? payload))
        }
      })
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const subscribe = useCallback((event: DashboardEvent, handler: EventHandler) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set())
    }
    handlersRef.current.get(event)!.add(handler)

    // Return unsubscribe function
    return () => {
      handlersRef.current.get(event)?.delete(handler)
    }
  }, [])

  return { subscribe, socket: socketRef }
}
