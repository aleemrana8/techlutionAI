import dotenv from 'dotenv'
import path from 'path'
// Load .env from backend/ for local dev, Vercel uses env vars directly
try { dotenv.config({ path: path.resolve(__dirname, '../.env') }) } catch {}
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import prisma from './config/database'
import { getRedis } from './config/redis'
import { requestLogger } from './middlewares/logger.middleware'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'

import authRoutes from './routes/auth.routes'
import projectRoutes from './routes/project.routes'
import contactRoutes from './routes/contact.routes'
import healthcareRoutes from './routes/healthcare.routes'
import workflowRoutes from './routes/workflow.routes'
import uploadRoutes from './routes/upload.routes'
import adminRoutes from './routes/admin.routes'
import {
  initEmbeddings, vectorSearch, getKeywordContext,
  detectLanguage, getMemory, addMemory, formatHistory,
  detectIntent, buildSystemPrompt, buildFinalPrompt, getSmartFallback,
} from './chat'
import { signAccessToken, verifyAccessToken } from './utils/jwt'
import { comparePassword, hashPassword } from './utils/bcrypt'
import { ROLE_PERMISSIONS } from './config/permissions'
import logger from './utils/logger'

const app = express()

// --- Security ---

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
    if (/\.vercel\.app$/.test(origin)) return callback(null, true)
    if (/\.onrender\.com$/.test(origin)) return callback(null, true)
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

// --- Rate Limiting ---

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX ?? '500', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
})

const loginLimiter = rateLimit({
  windowMs: 900000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
})

app.use('/api/', (req, res, next) => {
  if (req.path === '/admin/login' || req.path === '/admin/env-login') return next()
  limiter(req, res, next)
})

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
  } catch { checks.database = 'error' }

  try {
    const redis = getRedis()
    if (redis) { await redis.ping(); checks.redis = 'ok' }
    else checks.redis = 'not configured'
  } catch { checks.redis = 'error' }

  const healthy = checks.database === 'ok'
  res.status(healthy ? 200 : 503).json({
    success: healthy,
    message: healthy ? 'All systems operational' : 'Degraded',
    data: { ...checks, uptime: process.uptime(), timestamp: new Date().toISOString(), environment: process.env.NODE_ENV ?? 'development' },
  })
})

// --- API Routes ---

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/healthcare', healthcareRoutes)
app.use('/api/workflows', workflowRoutes)
app.use('/api/upload', uploadRoutes)

// --- Admin Auth (env-based fallback) — MUST be before adminRoutes ---

let adminPasswordHash: string | null = null

app.post('/api/admin/env-login', loginLimiter, async (req, res) => {
  const { adminId, password } = req.body
  const envId = (process.env.ADMIN_ID ?? 'Techlution811').trim()
  const envPwd = (process.env.ADMIN_PASSWORD ?? 'Ar@811811').trim()

  if (!adminId || !password || adminId !== envId) {
    res.status(401).json({ success: false, message: 'Invalid credentials' })
    return
  }
  if (!adminPasswordHash) adminPasswordHash = await hashPassword(envPwd)
  const valid = await comparePassword(password, adminPasswordHash)
  if (!valid) { res.status(401).json({ success: false, message: 'Invalid credentials' }); return }

  const token = signAccessToken({ sub: 'admin', email: 'admin@techlution.ai', role: 'SUPER_ADMIN' })
  res.json({ success: true, data: { token, user: { id: 'admin', name: 'Rana Muhammad Aleem', role: 'SUPER_ADMIN' }, permissions: ROLE_PERMISSIONS.SUPER_ADMIN } })
})

app.get('/api/admin/verify', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) { res.status(401).json({ success: false, message: 'No token provided' }); return }
  try {
    const payload = verifyAccessToken(authHeader.slice(7))
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE', 'MANAGER', 'SUPPORT']
    const role = (payload.role || '').toUpperCase()
    if (!validRoles.includes(role)) { res.status(403).json({ success: false, message: 'Forbidden' }); return }

    let user: any = { id: payload.sub, name: 'Rana Muhammad Aleem', role }
    try {
      const dbUser = await prisma.adminUser.findUnique({ where: { id: payload.sub }, select: { id: true, name: true, username: true, email: true, role: true } })
      if (dbUser) user = dbUser
    } catch {}
    res.json({ success: true, data: { user, permissions: ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] } })
  } catch { res.status(401).json({ success: false, message: 'Invalid or expired token' }) }
})

// Admin CRUD routes (requires auth)
app.use('/api/admin', adminRoutes)

// --- Public Visitor Tracking ---
app.post('/api/visitor', async (req, res) => {
  try {
    const { device, browser, os, page, referrer, sessionId } = req.body
    const visitor = await prisma.visitor.create({
      data: {
        ipAddress: req.ip || req.socket.remoteAddress,
        device: ['DESKTOP', 'MOBILE', 'TABLET'].includes(device) ? device : 'OTHER',
        browser, os, page, referrer, sessionId,
      },
    })
    // Socket.IO emit (skip in serverless)
    try { const { emitDashboardEvent } = await import('./config/socket'); emitDashboardEvent('visitor:new', { id: visitor.id, page, device }) } catch {}
    res.status(201).json({ success: true, data: { id: visitor.id } })
  } catch { res.status(500).json({ success: false, message: 'Failed to log visitor' }) }
})

// --- Chat Endpoint ---

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body
  if (!message || typeof message !== 'string') { res.status(400).json({ success: false, message: 'message is required' }); return }

  const sid = typeof sessionId === 'string' ? sessionId : 'default'
  const intent = detectIntent(message)
  const language = detectLanguage(message)
  const memory = getMemory(sid)
  const history = formatHistory(memory)

  let context: string
  try { context = await vectorSearch(message) } catch { context = getKeywordContext(message) }

  const systemPrompt = buildSystemPrompt(language)
  const enhancedPrompt = buildFinalPrompt({ message, intent, context, history, language })

  if (process.env.GEMINI_API_KEY) {
    const geminiModels = ['gemini-2.0-flash', 'gemini-2.0-flash-lite']
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim())
    for (const modelName of geminiModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          generationConfig: { temperature: 0.7, topP: 0.9, topK: 40, maxOutputTokens: 1024 },
        })
        const result = await model.generateContent(enhancedPrompt)
        const reply = result.response.text()
        if (reply && reply.trim().length > 5) { addMemory(sid, message, reply); res.json({ success: true, data: { reply, intent, language } }); return }
        logger.warn(`Gemini ${modelName}: empty response`)
      } catch (err: any) { logger.warn(`Gemini ${modelName} error:`, err?.message?.substring(0, 200) || err) }
    }
  } else {
    logger.warn('GEMINI_API_KEY not set — skipping Gemini')
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = (await import('openai')).default
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const completion = await openai.chat.completions.create({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: enhancedPrompt }], max_tokens: 800, temperature: 0.8 })
      const reply = completion.choices[0]?.message?.content ?? ''
      if (reply) { addMemory(sid, message, reply); res.json({ success: true, data: { reply, intent, language } }); return }
    } catch (err: any) { logger.warn('OpenAI unavailable:', err.message) }
  }

  const reply = getSmartFallback(message)
  addMemory(sid, message, reply)
  res.json({ success: true, data: { reply, intent, language } })
})

// --- Chat Stream (SSE) ---

app.get('/api/chat-stream', async (req, res) => {
  const message = typeof req.query.message === 'string' ? req.query.message.trim() : ''
  const sid = typeof req.query.sessionId === 'string' ? req.query.sessionId : 'default'
  if (!message) { res.status(400).json({ success: false, message: 'message is required' }); return }

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
  try { context = await vectorSearch(message) } catch { context = getKeywordContext(message) }

  const systemPrompt = buildSystemPrompt(language)
  const enhancedPrompt = buildFinalPrompt({ message, intent, context, history, language })
  res.write('data: ' + JSON.stringify({ type: 'meta', intent, language }) + '\n\n')

  let fullReply = ''

  if (process.env.GEMINI_API_KEY) {
    const geminiModels = ['gemini-2.0-flash', 'gemini-2.0-flash-lite']
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim())
    for (const modelName of geminiModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          generationConfig: { temperature: 0.7, topP: 0.9, topK: 40, maxOutputTokens: 1024 },
        })
        const result = await model.generateContentStream(enhancedPrompt)
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) { fullReply += text; res.write('data: ' + JSON.stringify({ type: 'chunk', text }) + '\n\n') }
        }
        if (fullReply) { addMemory(sid, message, fullReply); res.write('data: [DONE]\n\n'); res.end(); return }
      } catch (err: any) { logger.warn(`Gemini stream ${modelName} error:`, err?.message?.substring(0, 200) || err) }
    }
  }

  if (process.env.OPENAI_API_KEY && !fullReply) {
    try {
      const OpenAI = (await import('openai')).default
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const stream = await openai.chat.completions.create({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: enhancedPrompt }], max_tokens: 800, temperature: 0.8, stream: true })
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) { fullReply += text; res.write('data: ' + JSON.stringify({ type: 'chunk', text }) + '\n\n') }
      }
      if (fullReply) { addMemory(sid, message, fullReply); res.write('data: [DONE]\n\n'); res.end(); return }
    } catch (err: any) { logger.warn('OpenAI stream error:', err.message) }
  }

  if (!fullReply) {
    const fallback = getSmartFallback(message)
    addMemory(sid, message, fallback)
    const sentences = fallback.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [fallback]
    for (const sentence of sentences) {
      const words = sentence.split(/(\s+)/)
      for (let i = 0; i < words.length; i += 2) {
        const chunk = words.slice(i, i + 2).join('')
        if (chunk) { res.write('data: ' + JSON.stringify({ type: 'chunk', text: chunk }) + '\n\n') }
      }
    }
  }

  res.write('data: [DONE]\n\n')
  res.end()
})

// --- Error Handling ---
app.use(notFoundHandler)
app.use(errorHandler)

export default app
