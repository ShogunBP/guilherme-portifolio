import bcrypt from 'bcryptjs'

const password = process.argv[2]

if (!password) {
  console.error('Usage: npx tsx scripts/hash-password.ts <plain-password>')
  process.exit(1)
}

const salt = bcrypt.genSaltSync(12)
const hash = bcrypt.hashSync(password, salt)
const hashBase64 = Buffer.from(hash).toString('base64')

console.log('\n========================================')
console.log('Password hash generated successfully!')
console.log('========================================')
console.log(`ADMIN_PASSWORD_HASH="${hashBase64}"`)
console.log('========================================\n')
console.log('Obs: valor armazenado em Base64. O código decodifica automaticamente antes de comparar.')

