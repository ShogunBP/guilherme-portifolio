import bcrypt from 'bcryptjs'

const password = process.argv[2]

if (!password) {
  console.error('Usage: npx tsx scripts/hash-password.ts <plain-password>')
  process.exit(1)
}

const salt = bcrypt.genSaltSync(12)
const hash = bcrypt.hashSync(password, salt)

console.log('\n========================================')
console.log('Password hash generated successfully!')
console.log('========================================')
console.log(`ADMIN_PASSWORD_HASH="${hash}"`)
console.log('========================================\n')
