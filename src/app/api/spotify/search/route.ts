import { NextRequest, NextResponse } from 'next/server'
import { searchSpotify } from '@/lib/spotify/client'
import { isSpotifyTokenValid } from '@/lib/db/utils'
import type { SpotifyTrack, SpotifyPlaylist, SpotifyAlbum, SimpleSpotifyItem } from '@/lib/spotify/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') as 'track' | 'playlist' | 'album'
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Validate parameters
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }
    
    if (!type || !['track', 'playlist', 'album'].includes(type)) {
      return NextResponse.json({ error: 'Valid type parameter is required (track, playlist, album)' }, { status: 400 })
    }
    
    // Check if we have a valid Spotify token
    const hasValidToken = await isSpotifyTokenValid()
    if (!hasValidToken) {
      return NextResponse.json({ 
        error: 'Spotify not connected',
        code: 'SPOTIFY_NOT_CONNECTED'
      }, { status: 401 })
    }
    
    // Perform search
    const results = await searchSpotify(query, type, limit)
    
    // Transform results to simplified format
    const transformedResults: SimpleSpotifyItem[] = results.map((item: SpotifyTrack | SpotifyPlaylist | SpotifyAlbum) => {
      const baseItem: SimpleSpotifyItem = {
        id: item.id,
        name: item.name,
        uri: item.uri,
        type: type,
        image: item.images?.[0]?.url || undefined,
      }
      
      // Add type-specific fields
      switch (type) {
        case 'track':
          const track = item as SpotifyTrack
          return {
            ...baseItem,
            artist: track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist',
            album: track.album?.name || 'Unknown Album',
          }
        case 'playlist':
          const playlist = item as SpotifyPlaylist
          return {
            ...baseItem,
            description: playlist.description || `${playlist.tracks.total} tracks`,
            artist: playlist.owner?.display_name || 'Unknown Owner',
          }
        case 'album':
          const album = item as SpotifyAlbum
          return {
            ...baseItem,
            artist: album.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist',
            description: `${album.total_tracks} tracks • ${album.release_date?.split('-')[0] || 'Unknown Year'}`,
          }
        default:
          return baseItem
      }
    })
    
    return NextResponse.json({
      query,
      type,
      results: transformedResults,
      total: transformedResults.length
    })
    
  } catch (error) {
    console.error('❌ Spotify search error:', error)
    
    // Handle specific Spotify errors
    if (error instanceof Error && error.message.includes('No valid Spotify token')) {
      return NextResponse.json({ 
        error: 'Spotify not connected',
        code: 'SPOTIFY_NOT_CONNECTED'
      }, { status: 401 })
    }
    
    return NextResponse.json({ 
      error: 'Search failed',
      code: 'SEARCH_ERROR'
    }, { status: 500 })
  }
}
