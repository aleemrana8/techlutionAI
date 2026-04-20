// Vercel serverless catch-all — wraps Express backend for all /api/* routes
// not handled by specific api/*.ts functions (chat.ts, contact.ts, etc.)

import app from '../backend/src/app'

export default app
