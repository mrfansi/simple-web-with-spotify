import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default SpotifyToken record (empty initially)
  await prisma.spotifyToken.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    },
  })

  // Create default MusicSetting record
  await prisma.musicSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      type: null,
      uri: null,
      autoplay: true,
      loop: false,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('📋 Created records:')
  console.log('   - SpotifyToken (id: 1) - empty, ready for OAuth')
  console.log('   - MusicSetting (id: 1) - default settings')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
