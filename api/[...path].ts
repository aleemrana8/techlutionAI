// Vercel serverless catch-all — wraps Express backend for all /api/* routes
// not handled by specific api/*.ts functions (chat.ts, contact.ts, etc.)

import type { VercelRequest, VercelResponse } from '@vercel/node'
import app from '../backend/src/app'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return app(req, res)
  } catch (err: any) {
    console.error('Serverless function error:', err)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    })
  }
}
