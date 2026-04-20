import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || ''

let globalSocket: Socket | null = null

export function getAdminSocket(): Socket | null {
  return globalSocket
}

export function useAdminSocket(onEvent?: (event: string, data: any) => void) {
  const socketRef = useRef<Socket | null>(null)
  const callbackRef = useRef(onEvent)
  callbackRef.current = onEvent

  const connect = useCallback(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    if (globalSocket?.connected) {
      socketRef.current = globalSocket
      return
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    })

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to admin dashboard')
    })

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected')
    })

    // Listen to all dashboard events
    const events = [
      'lead:new', 'lead:update',
      'client:new', 'client:update',
      'project:update',
      'finance:new', 'finance:update',
      'visitor:new',
      'employee:new', 'employee:update',
      'dashboard:refresh',
    ]

    events.forEach(event => {
      socket.on(event, (data: any) => {
        callbackRef.current?.(event, data)
      })
    })

    globalSocket = socket
    socketRef.current = socket
  }, [])

  useEffect(() => {
    connect()
    return () => {
      // Don't disconnect on unmount — keep alive for the session
    }
  }, [connect])

  const disconnect = useCallback(() => {
    globalSocket?.disconnect()
    globalSocket = null
    socketRef.current = null
  }, [])

  return { socket: socketRef.current, disconnect }
}
