'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Tables } from '@/lib/supabase/types'

interface MusicSetting {
  hasMusic: boolean
  type?: string
  uri?: string
  embedUrl?: string | null
  autoplay: boolean
  loop: boolean
  updatedAt: string
}

type MusicSettingRow = Tables<'music_settings'>

export function useSupabaseRealtime() {
  const [isConnected, setIsConnected] = useState(false)
  const [musicSetting, setMusicSetting] = useState<MusicSetting | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to real-time changes on music_settings table
    const channel = supabase
      .channel('music_settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'music_settings'
        },
        (payload: RealtimePostgresChangesPayload<MusicSettingRow>) => {
          console.log('🎵 Received music setting update from Supabase:', payload)
          
          const newRecord = payload.new as MusicSettingRow
          
          // Convert database record to MusicSetting format
          const transformedSetting: MusicSetting = {
            hasMusic: Boolean(newRecord.uri && newRecord.type),
            type: newRecord.type?.toLowerCase() || undefined,
            uri: newRecord.uri || undefined,
            embedUrl: newRecord.uri ? getSpotifyEmbedUrl(newRecord.uri) : null,
            autoplay: newRecord.autoplay,
            loop: newRecord.loop,
            updatedAt: newRecord.updatedAt,
          }

          setMusicSetting(transformedSetting)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'music_settings'
        },
        (payload: RealtimePostgresChangesPayload<MusicSettingRow>) => {
          console.log('🎵 New music setting inserted:', payload)
          
          const newRecord = payload.new as MusicSettingRow
          
          const transformedSetting: MusicSetting = {
            hasMusic: Boolean(newRecord.uri && newRecord.type),
            type: newRecord.type?.toLowerCase() || undefined,
            uri: newRecord.uri || undefined,
            embedUrl: newRecord.uri ? getSpotifyEmbedUrl(newRecord.uri) : null,
            autoplay: newRecord.autoplay,
            loop: newRecord.loop,
            updatedAt: newRecord.updatedAt,
          }

          setMusicSetting(transformedSetting)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🔌 Connected to Supabase Realtime')
          setIsConnected(true)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.log('🔌 Disconnected from Supabase Realtime:', status)
          setIsConnected(false)
        }
      })

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Cleaning up Supabase Realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return {
    isConnected,
    musicSetting,
  }
}

// Hook specifically for the floating player - replaces useRealtimeMusicSetting
export function useRealtimeMusicSetting() {
  const { isConnected, musicSetting: realtimeMusicSetting } = useSupabaseRealtime()
  const [musicSetting, setMusicSetting] = useState<MusicSetting | null>(null)
  const supabase = createClient()

  // Update local state when realtime data changes
  useEffect(() => {
    if (realtimeMusicSetting) {
      setMusicSetting(realtimeMusicSetting)
    }
  }, [realtimeMusicSetting])
  
  // Load initial setting from Supabase
  useEffect(() => {
    const loadInitialSetting = async () => {
      try {
        const { data, error } = await supabase
          .from('music_settings')
          .select('*')
          .order('updatedAt', { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
          throw error
        }

        if (data) {
          console.log('🎵 Loaded initial music setting from Supabase:', data)
          
          const transformedSetting: MusicSetting = {
            hasMusic: Boolean(data.uri && data.type),
            type: data.type?.toLowerCase() || undefined,
            uri: data.uri || undefined,
            embedUrl: data.uri ? getSpotifyEmbedUrl(data.uri) : null,
            autoplay: data.autoplay,
            loop: data.loop,
            updatedAt: data.updatedAt,
          }

          setMusicSetting(transformedSetting)
        } else {
          // No initial setting found
          setMusicSetting({
            hasMusic: false,
            autoplay: true,
            loop: false,
            updatedAt: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error('❌ Failed to load initial music setting:', error)
        setMusicSetting({
          hasMusic: false,
          autoplay: true,
          loop: false,
          updatedAt: new Date().toISOString(),
        })
      }
    }

    // Only load initial setting if we haven't received realtime updates yet
    if (musicSetting === null) {
      loadInitialSetting()
    }
  }, [supabase, musicSetting])

  return {
    isConnected,
    musicSetting,
    hasMusic: musicSetting?.hasMusic || false,
    isLoading: musicSetting === null,
  }
}

// Helper function to generate Spotify embed URL (moved from spotify client)
function getSpotifyEmbedUrl(uri: string): string {
  try {
    // Parse spotify:track:4iV5W9uYEdYUVa79Axb7Rh format
    const parts = uri.split(':')
    if (parts.length !== 3 || parts[0] !== 'spotify') {
      throw new Error('Invalid Spotify URI format')
    }
    
    const [, type, id] = parts
    return `https://open.spotify.com/embed/${type}/${id}`
  } catch (error) {
    console.error('❌ Failed to generate Spotify embed URL:', error)
    return ''
  }
}
