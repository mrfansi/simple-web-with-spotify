import { Server as HttpServer } from 'http'
import { Server as IOServer, Socket } from 'socket.io'

// Singleton socket server instance
let io: IOServer | null = null

export function initializeSocketServer(httpServer: HttpServer): IOServer {
  if (io) {
    return io
  }

  io = new IOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    path: '/api/socketio',
  })

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)
    
    // Join the public room for receiving music updates
    socket.join('public')
    console.log(`📻 Client ${socket.id} joined public room`)
    
    // Handle client disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`)
    })
    
    // Handle room events (optional for future features)
    socket.on('join-room', (room: string) => {
      socket.join(room)
      console.log(`📻 Client ${socket.id} joined room: ${room}`)
    })
    
    socket.on('leave-room', (room: string) => {
      socket.leave(room)
      console.log(`📻 Client ${socket.id} left room: ${room}`)
    })
  })

  console.log('🚀 Socket.IO server initialized')
  return io
}

export function getSocketServer(): IOServer | null {
  return io
}

// Emit events to specific rooms
export function emitToRoom(room: string, event: string, data: unknown) {
  if (io) {
    io.to(room).emit(event, data)
    console.log(`📡 Emitted '${event}' to room '${room}':`, data)
  } else {
    console.warn('⚠️ Socket.IO server not initialized')
  }
}

// Emit music setting updates to all public clients
export function emitMusicUpdate(data: unknown) {
  emitToRoom('public', 'setting:update', data)
}

// Emit events to all connected clients
export function emitGlobal(event: string, data: unknown) {
  if (io) {
    io.emit(event, data)
    console.log(`📡 Global emit '${event}':`, data)
  } else {
    console.warn('⚠️ Socket.IO server not initialized')
  }
}

// Get connection stats
export function getConnectionStats() {
  if (!io) {
    return { connected: 0, rooms: {} }
  }
  
  const sockets = io.sockets.sockets
  const rooms = io.sockets.adapter.rooms
  
  return {
    connected: sockets.size,
    rooms: Array.from(rooms.keys()).reduce((acc, room) => {
      acc[room] = rooms.get(room)?.size || 0
      return acc
    }, {} as Record<string, number>)
  }
}
