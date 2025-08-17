import { Server as IOServer } from 'socket.io'

// Define global interface extension
declare global {
  var io: IOServer | undefined
}

// Get the global Socket.IO instance from custom server
function getGlobalSocketServer(): IOServer | null {
  if (typeof globalThis !== 'undefined' && globalThis.io) {
    return globalThis.io
  }
  return null
}

export function getSocketServer(): IOServer | null {
  return getGlobalSocketServer()
}

// Emit events to specific rooms
export function emitToRoom(room: string, event: string, data: unknown) {
  const io = getGlobalSocketServer()
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
  const io = getGlobalSocketServer()
  if (io) {
    io.emit(event, data)
    console.log(`📡 Global emit '${event}':`, data)
  } else {
    console.warn('⚠️ Socket.IO server not initialized')
  }
}

// Get connection stats
export function getConnectionStats() {
  const io = getGlobalSocketServer()
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
