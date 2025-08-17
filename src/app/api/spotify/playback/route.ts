import { NextRequest, NextResponse } from 'next/server'
import { getMusicSetting } from '@/lib/db/utils'
import { getSpotifyEmbedUrl } from '@/lib/spotify/client'

export async function GET(_request: NextRequest) {
  try {
    const musicSetting = await getMusicSetting()
    
    if (!musicSetting) {
      return NextResponse.json({ 
        error: 'No music setting found',
        code: 'NO_SETTING' 
      }, { status: 404 })
    }
    
    // If no music is configured, return empty state
    if (!musicSetting.uri || !musicSetting.type) {
      return NextResponse.json({
        hasMusic: false,
        autoplay: musicSetting.autoplay,
        loop: musicSetting.loop,
        updatedAt: musicSetting.updatedAt.toISOString(),
      })
    }
    
    // Get embed URL for Spotify iframe
    let embedUrl: string | null = null
    try {
      embedUrl = getSpotifyEmbedUrl(musicSetting.uri)
    } catch (error) {
      console.error('❌ Failed to generate embed URL:', error)
    }
    
    return NextResponse.json({
      hasMusic: true,
      type: musicSetting.type.toLowerCase(), // Convert 'TRACK' to 'track'
      uri: musicSetting.uri,
      embedUrl,
      autoplay: musicSetting.autoplay,
      loop: musicSetting.loop,
      updatedAt: musicSetting.updatedAt.toISOString(),
    })
    
  } catch (error) {
    console.error('❌ Failed to fetch playback settings:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch playback settings',
      code: 'FETCH_ERROR'
    }, { status: 500 })
  }
}

// Allow CORS for client-side requests
export async function OPTIONS(_request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
