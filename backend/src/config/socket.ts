import { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { verifyAccessToken } from '../utils/jwt'
import logger from '../utils/logger'

let io: SocketServer | null = null

export function initSocketIO(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
        if (/\.vercel\.app$/.test(origin)) return callback(null, true)
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true)
        callback(null, true) // Allow all in dev; tighten in production
      },
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // Auth middleware — verify JWT on connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '')
    if (!token) {
      return next(new Error('Authentication required'))
    }
    try {
      const payload = verifyAccessToken(token)
      ;(socket as any).admin = { id: payload.sub, role: payload.role, email: payload.email }
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const admin = (socket as any).admin
    logger.info(`Admin connected: ${admin?.email || admin?.id} (${socket.id})`)

    // Join role-based rooms
    if (admin?.role) {
      socket.join(`role:${admin.role}`)
    }
    socket.join('admin:dashboard')

    socket.on('disconnect', () => {
      logger.info(`Admin disconnected: ${admin?.email || admin?.id}`)
    })
  })

  logger.info('Socket.IO initialized')
  return io
}

export function getIO(): SocketServer | null {
  return io
}

// ─── Event Emitters ──────────────────────────────────────────────────────────

export type DashboardEvent =
  | 'inquiry:new'
  | 'inquiry:update'
  | 'client:new'
  | 'client:update'
  | 'project:update'
  | 'finance:new'
  | 'finance:update'
  | 'visitor:new'
  | 'employee:new'
  | 'employee:update'
  | 'task:new'
  | 'task:update'
  | 'dashboard:refresh'

export function emitDashboardEvent(event: DashboardEvent, data?: any): void {
  if (!io) return
  io.to('admin:dashboard').emit(event, {
    event,
    data,
    timestamp: new Date().toISOString(),
  })
}

export function emitToRole(role: string, event: string, data?: any): void {
  if (!io) return
  io.to(`role:${role}`).emit(event, { data, timestamp: new Date().toISOString() })
}
