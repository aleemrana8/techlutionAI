import Redis from 'ioredis'
import logger from '../utils/logger'

let redis: Redis | null = null

export function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null

  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })

    redis.on('connect', () => logger.info('Redis connected'))
    redis.on('error', (err) => logger.warn('Redis error (non-fatal):', err.message))
  }

  return redis
}

export async function setCache(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  const client = getRedis()
  if (!client) return
  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {
    // non-fatal
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedis()
  if (!client) return null
  try {
    const raw = await client.get(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export async function delCache(key: string): Promise<void> {
  const client = getRedis()
  if (!client) return
  try {
    await client.del(key)
  } catch {
    // non-fatal
  }
}
