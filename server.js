const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

let io

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.IO
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_SOCKET_URL || `http://localhost:${port}`,
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/api/socketio',
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)
    
    // Join the public room for receiving music updates
    socket.join('public')
    console.log(`📻 Client ${socket.id} joined public room`)
    
    // Handle client disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`)
    })
    
    // Handle room events (optional for future features)
    socket.on('join-room', (room) => {
      socket.join(room)
      console.log(`📻 Client ${socket.id} joined room: ${room}`)
    })
    
    socket.on('leave-room', (room) => {
      socket.leave(room)
      console.log(`📻 Client ${socket.id} left room: ${room}`)
    })
  })

  // Make io instance globally available
  global.io = io

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`🚀 Server running on http://${hostname}:${port}`)
      console.log(`📡 Socket.IO server initialized on path /api/socketio`)
    })
})

// Helper functions to emit events
function emitToRoom(room, event, data) {
  if (global.io) {
    global.io.to(room).emit(event, data)
    console.log(`📡 Emitted '${event}' to room '${room}':`, data)
  } else {
    console.warn('⚠️ Socket.IO server not initialized')
  }
}

function emitMusicUpdate(data) {
  emitToRoom('public', 'setting:update', data)
}

function getConnectionStats() {
  if (!global.io) {
    return { connected: 0, rooms: {} }
  }
  
  const sockets = global.io.sockets.sockets
  const rooms = global.io.sockets.adapter.rooms
  
  return {
    connected: sockets.size,
    rooms: Array.from(rooms.keys()).reduce((acc, room) => {
      acc[room] = rooms.get(room)?.size || 0
      return acc
    }, {})
  }
}

// Export functions for use in API routes
module.exports = {
  emitToRoom,
  emitMusicUpdate,
  getConnectionStats
}
