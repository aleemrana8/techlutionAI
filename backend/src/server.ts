import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'

import prisma from './config/database'
import { getRedis } from './config/redis'
import logger from './utils/logger'
import { requestLogger } from './middlewares/logger.middleware'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'

import authRoutes from './routes/auth.routes'
import projectRoutes from './routes/project.routes'
import contactRoutes from './routes/contact.routes'
import healthcareRoutes from './routes/healthcare.routes'
import workflowRoutes from './routes/workflow.routes'
import uploadRoutes from './routes/upload.routes'
import {
  initEmbeddings, vectorSearch, getKeywordContext,
  detectLanguage, getMemory, addMemory, formatHistory,
  detectIntent, buildSystemPrompt, buildFinalPrompt, getSmartFallback,
} from './chat'

const app = express()
const PORT = parseInt(process.env.PORT ?? '5000', 10)

// --- Security ---

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
    if (/\.vercel\.app$/.test(origin)) return callback(null, true)
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

// --- Rate Limiting ---

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

// --- Body Parsing ---

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// --- Static Files ---

const uploadDir = process.env.UPLOAD_DIR ?? './uploads'
app.use('/uploads', express.static(path.resolve(uploadDir)))

// --- Logging ---

app.use(requestLogger)

// --- Health Check ---

app.get('/health', async (_req, res) => {
  const checks: Record<string, string> = { server: 'ok' }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch {
    checks.database = 'error'
  }

  try {
    const redis = getRedis()
    if (redis) {
      await redis.ping()
      checks.redis = 'ok'
    } else {
      checks.redis = 'not configured'
    }
  } catch {
    checks.redis = 'error'
  }

  const healthy = checks.database === 'ok'
  res.status(healthy ? 200 : 503).json({
    success: healthy,
    message: healthy ? 'All systems operational' : 'Degraded',
    data: {
      ...checks,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
    },
  })
})

// --- API Routes ---

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/healthcare', healthcareRoutes)
app.use('/api/workflows', workflowRoutes)
app.use('/api/upload', uploadRoutes)

// --- Admin Auth ---

import { signAccessToken, verifyAccessToken } from './utils/jwt'
import { comparePassword, hashPassword } from './utils/bcrypt'

// Pre-hash on first use; admin credentials from env vars
let adminPasswordHash: string | null = null

app.post('/api/admin/login', async (req, res) => {
  const { adminId, password } = req.body
  const envId = process.env.ADMIN_ID ?? 'Techlution811'
  const envPwd = process.env.ADMIN_PASSWORD ?? 'Ar@811811'

  if (!adminId || !password || adminId !== envId) {
    res.status(401).json({ success: false, message: 'Invalid credentials' })
    return
  }

  // Hash the env password once for timing-safe comparison
  if (!adminPasswordHash) {
    adminPasswordHash = await hashPassword(envPwd)
  }

  const valid = await comparePassword(password, adminPasswordHash)
  if (!valid) {
    res.status(401).json({ success: false, message: 'Invalid credentials' })
    return
  }

  const token = signAccessToken({ sub: 'admin', email: 'admin@techlution.ai', role: 'admin' })
  res.json({
    success: true,
    data: {
      token,
      user: { id: 'admin', name: 'Rana Muhammad Aleem' },
    },
  })
})

app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' })
    return
  }
  try {
    const payload = verifyAccessToken(authHeader.slice(7))
    if (payload.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Forbidden' })
      return
    }
    res.json({ success: true, data: { user: { id: payload.sub, name: 'Rana Muhammad Aleem' } } })
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
})

// --- Chat Endpoint (Advanced RAG + Memory + Multi-Language) ---

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body
  if (!message || typeof message !== 'string') {
    res.status(400).json({ success: false, message: 'message is required' })
    return
  }

  const sid = typeof sessionId === 'string' ? sessionId : 'default'
  const intent = detectIntent(message)
  const language = detectLanguage(message)
  const memory = getMemory(sid)
  const history = formatHistory(memory)

  let context: string
  try {
    context = await vectorSearch(message)
  } catch {
    context = getKeywordContext(message)
  }

  const systemPrompt = buildSystemPrompt(language)
  const enhancedPrompt = buildFinalPrompt({ message, intent, context, history, language })

  // Gemini (primary)
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt,
        generationConfig: { temperature: 0.8, topP: 0.92, topK: 40, maxOutputTokens: 800 },
      })
      const result = await model.generateContent(enhancedPrompt)
      const reply = result.response.text()
      if (reply) {
        addMemory(sid, message, reply)
        res.json({ success: true, data: { reply, intent, language } })
        return
      }
    } catch (err: any) {
      logger.warn('Gemini unavailable:', err.message ?? err)
    }
  }

  // OpenAI fallback
  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = (await import('openai')).default
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: enhancedPrompt },
        ],
        max_tokens: 800,
        temperature: 0.8,
      })
      const reply = completion.choices[0]?.message?.content ?? ''
      if (reply) {
        addMemory(sid, message, reply)
        res.json({ success: true, data: { reply, intent, language } })
        return
      }
    } catch (err: any) {
      logger.warn('OpenAI unavailable:', err.message)
    }
  }

  // Keyword fallback
  const reply = getSmartFallback(message)
  addMemory(sid, message, reply)
  res.json({ success: true, data: { reply, intent, language } })
})

// --- Chat Stream Endpoint (SSE) ---

app.get('/api/chat-stream', async (req, res) => {
  const message = typeof req.query.message === 'string' ? req.query.message.trim() : ''
  const sid = typeof req.query.sessionId === 'string' ? req.query.sessionId : 'default'

  if (!message) {
    res.status(400).json({ success: false, message: 'message is required' })
    return
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.flushHeaders()

  const intent = detectIntent(message)
  const language = detectLanguage(message)
  const memory = getMemory(sid)
  const history = formatHistory(memory)

  let context: string
  try {
    context = await vectorSearch(message)
  } catch {
    context = getKeywordContext(message)
  }

  const systemPrompt = buildSystemPrompt(language)
  const enhancedPrompt = buildFinalPrompt({ message, intent, context, history, language })

  // Send metadata first
  res.write('data: ' + JSON.stringify({ type: 'meta', intent, language }) + '\n\n')

  let fullReply = ''

  // Gemini (primary)
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt,
        generationConfig: { temperature: 0.8, topP: 0.92, topK: 40, maxOutputTokens: 800 },
      })
      const result = await model.generateContentStream(enhancedPrompt)
      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) {
          fullReply += text
          res.write('data: ' + JSON.stringify({ type: 'chunk', text }) + '\n\n')
        }
      }
      if (fullReply) {
        addMemory(sid, message, fullReply)
        res.write('data: [DONE]\n\n')
        res.end()
        return
      }
    } catch (err: any) {
      logger.warn('Gemini stream error:', err.message ?? err)
    }
  }

  // OpenAI fallback (stream)
  if (process.env.OPENAI_API_KEY && !fullReply) {
    try {
      const OpenAI = (await import('openai')).default
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: enhancedPrompt },
        ],
        max_tokens: 800,
        temperature: 0.8,
        stream: true,
      })
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) {
          fullReply += text
          res.write('data: ' + JSON.stringify({ type: 'chunk', text }) + '\n\n')
        }
      }
      if (fullReply) {
        addMemory(sid, message, fullReply)
        res.write('data: [DONE]\n\n')
        res.end()
        return
      }
    } catch (err: any) {
      logger.warn('OpenAI stream error:', err.message)
    }
  }

  // Keyword fallback — simulate streaming with word chunks
  if (!fullReply) {
    const fallback = getSmartFallback(message)
    addMemory(sid, message, fallback)
    // Split into sentences then words for natural feel
    const sentences = fallback.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [fallback]
    for (const sentence of sentences) {
      const words = sentence.split(/(\s+)/)
      for (let i = 0; i < words.length; i += 2) {
        const chunk = words.slice(i, i + 2).join('')
        if (chunk) {
          res.write('data: ' + JSON.stringify({ type: 'chunk', text: chunk }) + '\n\n')
          await new Promise(r => setTimeout(r, 25))
        }
      }
    }
  }

  res.write('data: [DONE]\n\n')
  res.end()
})

// --- Error Handling ---

app.use(notFoundHandler)
app.use(errorHandler)

// --- Start ---

async function bootstrap() {
  try {
    await prisma.$connect()
    logger.info('Database connected')

    const redis = getRedis()
    if (redis) {
      await redis.connect().catch(() => logger.warn('Redis unavailable - caching disabled'))
    }

    // Initialize vector embeddings for RAG
    await initEmbeddings().catch(err => logger.warn('Embeddings init skipped:', err.message))

    app.listen(PORT, () => {
      logger.info('Techlution AI API running on http://localhost:' + PORT)
      logger.info('Health check: http://localhost:' + PORT + '/health')
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
