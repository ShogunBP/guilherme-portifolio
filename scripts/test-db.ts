import { db } from '../src/lib/db'

async function main() {
  console.log('Testing Prisma SQLite connection...')
  
  // Clean up previous test entry if exists
  await db.twoFactorAuth.deleteMany({ where: { id: 'test' } })

  // Create record
  const created = await db.twoFactorAuth.create({
    data: {
      id: 'test',
      secret: 'BASE32SECRETTEST123',
      enabled: false,
    },
  })
  console.log('Created record:', created)

  // Read record
  const fetched = await db.twoFactorAuth.findUnique({
    where: { id: 'test' },
  })
  console.log('Fetched record:', fetched)

  if (fetched?.secret === 'BASE32SECRETTEST123') {
    console.log('✅ SQLite persistence test passed!')
  } else {
    console.error('❌ Failed: secret does not match')
    process.exit(1)
  }

  // Clean up
  await db.twoFactorAuth.delete({ where: { id: 'test' } })
  console.log('Test record cleaned up successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
