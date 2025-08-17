import { NextRequest, NextResponse } from 'next/server'
import { updateMusicSetting } from '@/lib/db/utils'
import { getSpotifyEmbedUrl } from '@/lib/spotify/client'
import { emitMusicUpdate } from '@/lib/realtime/socket-server'
import { MusicType } from '@prisma/client'
import { z } from 'zod'

// Schema for validating the request body
const updateSettingSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
  type: z.enum(['TRACK', 'PLAYLIST', 'ALBUM']),
  autoplay: z.boolean().optional(),
  loop: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = updateSettingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }, { status: 400 })
    }
    
    const { uri, type, autoplay, loop } = validation.data
    
    // Validate Spotify URI format
    if (!uri.startsWith('spotify:')) {
      return NextResponse.json({
        error: 'Invalid Spotify URI format'
      }, { status: 400 })
    }
    
    // Update settings in database
    const updatedSetting = await updateMusicSetting({
      type: type as MusicType,
      uri,
      autoplay,
      loop,
    })
    
    // Generate embed URL
    let embedUrl: string | null = null
    try {
      embedUrl = getSpotifyEmbedUrl(uri)
    } catch (error) {
      console.error('❌ Failed to generate embed URL:', error)
    }
    
    // Prepare response data
    const responseData = {
      hasMusic: true,
      type: updatedSetting.type?.toLowerCase(),
      uri: updatedSetting.uri,
      embedUrl,
      autoplay: updatedSetting.autoplay,
      loop: updatedSetting.loop,
      updatedAt: updatedSetting.updatedAt.toISOString(),
    }
    
    // Emit socket event for real-time updates
    try {
      emitMusicUpdate(responseData)
    } catch (error) {
      console.warn('⚠️ Failed to emit socket update:', error)
      // Don't fail the request if socket emit fails
    }
    
    console.log('✅ Music setting updated:', {
      type: updatedSetting.type,
      uri: updatedSetting.uri,
      autoplay: updatedSetting.autoplay,
      loop: updatedSetting.loop
    })
    
    return NextResponse.json({
      success: true,
      message: 'Music setting updated successfully',
      data: responseData
    })
    
  } catch (error) {
    console.error('❌ Failed to update music setting:', error)
    return NextResponse.json({
      error: 'Failed to update music setting',
      code: 'UPDATE_ERROR'
    }, { status: 500 })
  }
}

// Allow CORS for client-side requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
