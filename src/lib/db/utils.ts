import { MusicType } from '@prisma/client'
import { prisma } from './prisma'

// SpotifyToken utilities
export async function getSpotifyToken() {
  return await prisma.spotifyToken.findUnique({
    where: { id: 1 }
  })
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
}

export async function updateSpotifyAccessToken(accessToken: string, expiresIn: number) {
  const expiresAt = new Date(Date.now() + (expiresIn * 1000))
  
  return await prisma.spotifyToken.update({
    where: { id: 1 },
    data: {
      accessToken,
      expiresAt,
    }
  })
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
  return await prisma.musicSetting.findUnique({
    where: { id: 1 }
  })
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
}

export async function updatePlaybackSettings({
  autoplay,
  loop
}: {
  autoplay?: boolean
  loop?: boolean
}) {
  return await prisma.musicSetting.update({
    where: { id: 1 },
    data: {
      ...(autoplay !== undefined && { autoplay }),
      ...(loop !== undefined && { loop }),
    }
  })
}
