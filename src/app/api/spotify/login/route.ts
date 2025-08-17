import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationUrl } from '@/lib/spotify/client'

export async function GET(request: NextRequest) {
  try {
    const authUrl = getAuthorizationUrl()
    
    // Redirect user to Spotify authorization page
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('❌ Spotify login error:', error)
    
    // Redirect to admin with error
    const adminUrl = new URL('/admin', request.url)
    adminUrl.searchParams.set('error', 'Failed to initiate Spotify authorization')
    
    return NextResponse.redirect(adminUrl)
  }
}
