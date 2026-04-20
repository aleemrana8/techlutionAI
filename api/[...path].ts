// Vercel serverless catch-all — wraps Express backend for all /api/* routes
// not handled by specific api/*.ts functions (chat.ts, contact.ts, etc.)

import type { VercelRequest, VercelResponse } from '@vercel/node'

let app: any = null

async function getApp() {
  if (!app) {
    const mod = await import('../backend/src/app')
    app = mod.default || mod
  }
  return app
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = await getApp()
  return expressApp(req, res)
}
