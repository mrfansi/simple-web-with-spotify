import SpotifyWebApi from 'spotify-web-api-node'
import { getSpotifyToken, saveSpotifyTokens, updateSpotifyAccessToken, isSpotifyTokenValid } from '@/lib/db/utils'

// Spotify API client singleton
let spotifyClient: SpotifyWebApi | null = null

export function createSpotifyClient() {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error('Missing Spotify credentials in environment variables')
  }

  return new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  })
}

export async function getSpotifyClient(): Promise<SpotifyWebApi> {
  if (!spotifyClient) {
    spotifyClient = createSpotifyClient()
  }

  // Check if we have a valid token
  const isValid = await isSpotifyTokenValid()
  
  if (!isValid) {
    // Try to refresh the token
    const refreshed = await refreshSpotifyToken()
    if (!refreshed) {
      throw new Error('No valid Spotify token available. Please re-authenticate.')
    }
  }

  // Load current token
  const tokenData = await getSpotifyToken()
  if (tokenData?.accessToken) {
    spotifyClient.setAccessToken(tokenData.accessToken)
  }

  return spotifyClient
}

export async function refreshSpotifyToken(): Promise<boolean> {
  try {
    const tokenData = await getSpotifyToken()
    
    if (!tokenData?.refreshToken) {
      console.log('No refresh token available')
      return false
    }

    const client = createSpotifyClient()
    client.setRefreshToken(tokenData.refreshToken)
    
    const response = await client.refreshAccessToken()
    const { access_token, expires_in } = response.body
    
    // Update access token in database
    await updateSpotifyAccessToken(access_token, expires_in)
    
    console.log('✅ Spotify token refreshed successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to refresh Spotify token:', error)
    return false
  }
}

// OAuth helpers
export function getAuthorizationUrl(scopes: string[] = [
  'user-read-private',
  'user-read-email',
  'user-read-playback-state',
  'user-modify-playback-state',
  'streaming',
  'playlist-read-private',
  'playlist-read-collaborative'
]) {
  const client = createSpotifyClient()
  const state = Math.random().toString(36).substring(2, 15) // Simple state for CSRF protection
  
  return client.createAuthorizeURL(scopes, state)
}

export async function exchangeCodeForTokens(code: string) {
  try {
    const client = createSpotifyClient()
    const response = await client.authorizationCodeGrant(code)
    
    const { access_token, refresh_token, expires_in } = response.body
    
    // Save tokens to database
    await saveSpotifyTokens({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
    })
    
    console.log('✅ Spotify tokens saved successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to exchange code for tokens:', error)
    return false
  }
}

// Utility functions
export function getSpotifyEmbedUrl(uri: string): string {
  // Convert spotify:track:4iV5W9uYEdYUVa79Axb7Rh to https://open.spotify.com/embed/track/4iV5W9uYEdYUVa79Axb7Rh
  const parts = uri.split(':')
  if (parts.length !== 3 || parts[0] !== 'spotify') {
    throw new Error('Invalid Spotify URI format')
  }
  
  const [, type, id] = parts
  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
}

export function getSpotifyPreviewUrl(uri: string): string {
  const parts = uri.split(':')
  if (parts.length !== 3 || parts[0] !== 'spotify') {
    throw new Error('Invalid Spotify URI format')
  }
  
  const [, type, id] = parts
  return `https://open.spotify.com/${type}/${id}`
}

// Search functions
export async function searchSpotify(query: string, type: 'track' | 'playlist' | 'album' = 'track', limit: number = 20) {
  try {
    const client = await getSpotifyClient()
    const response = await client.search(query, [type], { limit })
    
    switch (type) {
      case 'track':
        return response.body.tracks?.items || []
      case 'playlist':
        return response.body.playlists?.items || []
      case 'album':
        return response.body.albums?.items || []
      default:
        return []
    }
  } catch (error) {
    console.error('❌ Spotify search error:', error)
    throw error
  }
}

// Token refresh scheduler (for long-running processes)
let refreshInterval: NodeJS.Timeout | null = null

export function startTokenRefreshScheduler() {
  // Refresh token every 50 minutes (tokens expire after 1 hour)
  const REFRESH_INTERVAL = 50 * 60 * 1000 // 50 minutes in ms
  
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  
  refreshInterval = setInterval(async () => {
    const isValid = await isSpotifyTokenValid()
    if (!isValid) {
      await refreshSpotifyToken()
    }
  }, REFRESH_INTERVAL)
  
  console.log('🔄 Spotify token refresh scheduler started')
}

export function stopTokenRefreshScheduler() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
    console.log('⏹️ Spotify token refresh scheduler stopped')
  }
}
