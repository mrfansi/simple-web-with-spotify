import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL
    }
  }
})

interface SpotifyTokenData {
  id: number
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  createdAt: number
  updatedAt: number
}

interface MusicSettingData {
  id: number
  type: string | null
  uri: string | null
  autoplay: number
  loop: number
  updatedAt: number
}

async function migrateData() {
  try {
    console.log('🚀 Starting SQLite to Supabase migration...')

    // Read exported JSON files
    const tokensRaw = fs.readFileSync(path.join(__dirname, 'tokens.json'), 'utf-8')
    const settingsRaw = fs.readFileSync(path.join(__dirname, 'music_settings.json'), 'utf-8')

    const tokens: SpotifyTokenData[] = JSON.parse(tokensRaw)
    const settings: MusicSettingData[] = JSON.parse(settingsRaw)

    console.log(`📦 Found ${tokens.length} Spotify tokens and ${settings.length} music settings`)

    // Migrate Spotify tokens
    for (const token of tokens) {
      console.log('🔑 Migrating Spotify token...')
      
      await prisma.spotifyToken.create({
        data: {
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          expiresAt: token.expiresAt ? new Date(token.expiresAt) : null,
          createdAt: new Date(token.createdAt),
          updatedAt: new Date(token.updatedAt),
        }
      })
    }

    // Migrate music settings
    for (const setting of settings) {
      console.log('🎵 Migrating music setting...')
      
      await prisma.musicSetting.create({
        data: {
          type: setting.type as any, // Will be null, which is fine
          uri: setting.uri,
          autoplay: Boolean(setting.autoplay),
          loop: Boolean(setting.loop),
          updatedAt: new Date(setting.updatedAt),
        }
      })
    }

    // Verify migration
    const tokenCount = await prisma.spotifyToken.count()
    const settingsCount = await prisma.musicSetting.count()
    
    console.log('✅ Migration completed successfully!')
    console.log(`📊 Final counts: ${tokenCount} tokens, ${settingsCount} settings`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('🎉 All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
