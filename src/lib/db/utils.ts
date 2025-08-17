import { MusicType } from '@prisma/client'
import { prisma } from './prisma'

// SpotifyToken utilities
export async function getSpotifyToken() {
  try {
    return await prisma.spotifyToken.findUnique({
      where: { id: 1 }
    })
  } catch (error) {
    console.warn('Database not available:', error)
    return null
  }
}

export async function saveSpotifyTokens({
  accessToken,
  refreshToken,
  expiresIn
}: {
  accessToken: string
  refreshToken: string  
  expiresIn: number // seconds from now
}) {
  const expiresAt = new Date(Date.now() + (expiresIn * 1000))
  
  try {
    return await prisma.spotifyToken.upsert({
      where: { id: 1 },
      update: {
        accessToken,
        refreshToken,
        expiresAt,
      },
      create: {
        id: 1,
        accessToken,
        refreshToken,
        expiresAt,
      }
    })
  } catch (error) {
    console.warn('Database not available, tokens not persisted:', error)
    return null
  }
}

export async function updateSpotifyAccessToken(accessToken: string, expiresIn: number) {
  const expiresAt = new Date(Date.now() + (expiresIn * 1000))
  
  try {
    return await prisma.spotifyToken.update({
      where: { id: 1 },
      data: {
        accessToken,
        expiresAt,
      }
    })
  } catch (error) {
    console.warn('Database not available, token update failed:', error)
    return null
  }
}

export async function isSpotifyTokenValid() {
  const token = await getSpotifyToken()
  
  if (!token?.accessToken || !token?.expiresAt) {
    return false
  }
  
  // Check if token expires in next 5 minutes (buffer time)
  const buffer = 5 * 60 * 1000 // 5 minutes in ms
  return token.expiresAt.getTime() > Date.now() + buffer
}

// MusicSetting utilities
export async function getMusicSetting() {
  try {
    return await prisma.musicSetting.findUnique({
      where: { id: 1 }
    })
  } catch (error) {
    console.warn('Database not available:', error)
    return null
  }
}

export async function updateMusicSetting({
  type,
  uri,
  autoplay,
  loop
}: {
  type: MusicType
  uri: string
  autoplay?: boolean
  loop?: boolean
}) {
  try {
    return await prisma.musicSetting.upsert({
      where: { id: 1 },
      update: {
        type,
        uri,
        ...(autoplay !== undefined && { autoplay }),
        ...(loop !== undefined && { loop }),
      },
      create: {
        id: 1,
        type,
        uri,
        autoplay: autoplay ?? true,
        loop: loop ?? false,
      }
    })
  } catch (error) {
    console.warn('Database not available, music setting not persisted:', error)
    return null
  }
}

export async function updatePlaybackSettings({
  autoplay,
  loop
}: {
  autoplay?: boolean
  loop?: boolean
}) {
  try {
    return await prisma.musicSetting.update({
      where: { id: 1 },
      data: {
        ...(autoplay !== undefined && { autoplay }),
        ...(loop !== undefined && { loop }),
      }
    })
  } catch (error) {
    console.warn('Database not available, playback settings not updated:', error)
    return null
  }
}
