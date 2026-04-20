import dotenv from 'dotenv'
dotenv.config()

import { createServer } from 'http'
import app from './app'
import prisma from './config/database'
import { getRedis } from './config/redis'
import { initSocketIO } from './config/socket'
import { initScheduler } from './config/scheduler'
import { initEmbeddings } from './chat'
import logger from './utils/logger'

const PORT = parseInt(process.env.PORT ?? '5000', 10)
const httpServer = createServer(app)

async function bootstrap() {
  try {
    await prisma.$connect()
    logger.info('Database connected')

    const redis = getRedis()
    if (redis) {
      await redis.connect().catch(() => logger.warn('Redis unavailable - caching disabled'))
    }

    await initEmbeddings().catch(err => logger.warn('Embeddings init skipped:', err.message))

    initSocketIO(httpServer)
    initScheduler()

    // Seed super admin if no admin users exist
    const adminCount = await prisma.adminUser.count()
    if (adminCount === 0) {
      const { hashPassword: hp } = await import('./utils/bcrypt')
      const envPwd = process.env.ADMIN_PASSWORD ?? 'Ar@811811'
      await prisma.adminUser.create({
        data: {
          username: process.env.ADMIN_ID ?? 'Techlution811',
          email: 'admin@techlution.ai',
          passwordHash: await hp(envPwd),
          name: 'Rana Muhammad Aleem',
          role: 'SUPER_ADMIN',
        },
      })
      logger.info('Seeded default SUPER_ADMIN user from env vars')
    }

    httpServer.listen(PORT, () => {
      logger.info('Techlution AI API running on http://localhost:' + PORT)
      logger.info('Health check: http://localhost:' + PORT + '/health')
      logger.info('Socket.IO: ws://localhost:' + PORT)
      logger.info('Environment: ' + (process.env.NODE_ENV ?? 'development'))
    })
  } catch (err) {
    logger.error('Failed to start server:', err)
    process.exit(1)
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received - shutting down gracefully')
  await prisma.$disconnect()
  const redis = getRedis()
  if (redis) redis.disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received - shutting down')
  await prisma.$disconnect()
  const redis = getRedis()
  if (redis) redis.disconnect()
  process.exit(0)
})

bootstrap()

export default app
