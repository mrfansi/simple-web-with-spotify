'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface MusicSetting {
  hasMusic: boolean
  type?: string
  uri?: string
  embedUrl?: string | null
  autoplay: boolean
  loop: boolean
  updatedAt: string
}

let socket: Socket | null = null

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [musicSetting, setMusicSetting] = useState<MusicSetting | null>(null)

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'
      
      socket = io(socketUrl, {
        path: '/api/socketio',
        transports: ['polling', 'websocket'],
      })

      socket.on('connect', () => {
        console.log('🔌 Connected to socket server')
        setIsConnected(true)
      })

      socket.on('disconnect', () => {
        console.log('🔌 Disconnected from socket server')
        setIsConnected(false)
      })

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error)
        setIsConnected(false)
      })
    }

    return () => {
      // Don't disconnect on component unmount to maintain persistent connection
      // socket?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    // Listen for music setting updates
    const handleSettingUpdate = (data: MusicSetting) => {
      console.log('🎵 Received music setting update:', data)
      setMusicSetting(data)
    }

    socket.on('setting:update', handleSettingUpdate)

    // Cleanup listener
    return () => {
      socket?.off('setting:update', handleSettingUpdate)
    }
  }, [])

  return {
    isConnected,
    musicSetting,
    socket,
  }
}

// Hook specifically for the floating player
export function useRealtimeMusicSetting() {
  const { isConnected, musicSetting } = useSocket()
  
  // Load initial setting from API
  useEffect(() => {
    const loadInitialSetting = async () => {
      try {
        const response = await fetch('/api/spotify/playback')
        if (response.ok) {
          const data = await response.json()
          console.log('🎵 Loaded initial music setting:', data)
          // Only set if we haven't received socket updates yet
          if (!musicSetting) {
            // This will be handled by the socket update logic
          }
        }
      } catch (error) {
        console.error('❌ Failed to load initial music setting:', error)
      }
    }

    loadInitialSetting()
  }, [musicSetting])

  return {
    isConnected,
    musicSetting,
    hasMusic: musicSetting?.hasMusic || false,
    isLoading: musicSetting === null,
  }
}
