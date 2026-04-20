// Vercel serverless catch-all — wraps Express backend for all /api/* routes
// not handled by specific api/*.ts functions (chat.ts, contact.ts, etc.)

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

let app: any = null

function getApp() {
  if (!app) {
    try {
      // Import pre-compiled backend (built by tsc during Vercel build step)
      const mod = require('../backend/dist/app')
      app = mod.default || mod
    } catch (err: any) {
      console.error('Failed to load Express app:', err.message)
      throw err
    }
  }
  return app
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = getApp()
    return expressApp(req, res)
  } catch (err: any) {
    console.error('Serverless function error:', err)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
      stack: err.stack?.split('\n').slice(0, 5),
    })
  }
}
