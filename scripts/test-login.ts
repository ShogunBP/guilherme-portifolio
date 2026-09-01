import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

let email = ''
let hash = ''

for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (trimmed.startsWith('ADMIN_EMAIL=')) {
    email = trimmed.replace('ADMIN_EMAIL=', '').replace(/["']/g, '')
  }
  if (trimmed.startsWith('ADMIN_PASSWORD_HASH=')) {
    hash = trimmed.replace('ADMIN_PASSWORD_HASH=', '').replace(/["']/g, '')
  }
}

console.log('Testing Authentication:')
console.log('Loaded Email:', email)
console.log('Loaded Hash:', hash)

const isEmailMatch = 'admin@guilhermemenezes.dev' === email.toLowerCase()
console.log('Email Match:', isEmailMatch)

const isPasswordMatch = bcrypt.compareSync('admin', hash)
console.log('Password Match:', isPasswordMatch)
