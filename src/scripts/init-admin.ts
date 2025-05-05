import bcrypt from 'bcrypt'
import { CreateUser, GetUserByUsername } from '../lib/db'

const InitAdmin = async () => {
  const AdminExists = await GetUserByUsername('admin')
  if (AdminExists) {
    console.log('Admin user already exists')
    return
  }

  const HashedPassword = await bcrypt.hash('admin', 10)
  await CreateUser('admin', HashedPassword)
  console.log('Admin user created successfully')
}

InitAdmin().catch(e => {
  console.error('Error initializing admin user:', e)
  process.exit(1)
}) 