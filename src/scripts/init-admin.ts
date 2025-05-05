import bcrypt from 'bcrypt'
import { CreateUser, GetUserByUsername } from '../lib/db'

const _InitAdmin = async () => {
  const _AdminExists = GetUserByUsername('admin')
  if (_AdminExists) {
    console.log('Admin user already exists')
    return
  }

  const _HashedPassword = await bcrypt.hash('admin', 10)
  CreateUser('admin', _HashedPassword)
  console.log('Admin user created successfully')
}

_InitAdmin() 