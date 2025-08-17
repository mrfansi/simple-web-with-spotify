import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/spotify/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  
  const adminUrl = new URL('/admin', request.url)
  
  // Handle authorization errors
  if (error) {
    console.error('❌ Spotify authorization error:', error)
    adminUrl.searchParams.set('error', `Spotify authorization failed: ${error}`)
    return NextResponse.redirect(adminUrl)
  }
  
  // Handle missing code
  if (!code) {
    console.error('❌ Missing authorization code')
    adminUrl.searchParams.set('error', 'Authorization code not received')
    return NextResponse.redirect(adminUrl)
  }
  
  try {
    // Exchange code for tokens
    const success = await exchangeCodeForTokens(code)
    
    if (success) {
      // Success - redirect to admin dashboard
      adminUrl.searchParams.set('success', 'Spotify connected successfully!')
      return NextResponse.redirect(adminUrl)
    } else {
      // Failed to exchange tokens
      adminUrl.searchParams.set('error', 'Failed to obtain Spotify tokens')
      return NextResponse.redirect(adminUrl)
    }
  } catch (error) {
    console.error('❌ Token exchange error:', error)
    adminUrl.searchParams.set('error', 'Failed to connect to Spotify')
    return NextResponse.redirect(adminUrl)
  }
}
