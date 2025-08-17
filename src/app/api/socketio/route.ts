import { NextRequest } from 'next/server'

// This is a custom handler to initialize Socket.IO with Next.js
export async function GET(_req: NextRequest) {
  // In production, this endpoint should not be accessible
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not Found', { status: 404 })
  }

  return new Response(JSON.stringify({ 
    message: 'Socket.IO server endpoint',
    path: '/api/socketio'
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
