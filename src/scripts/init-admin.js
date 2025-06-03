import bcrypt from 'bcrypt'
import { PrismaClient } from '../../src/generated/prisma/index.js'

const InitAdmin = async () => {
  const Prisma = new PrismaClient()
  
  try {
    const AdminExists = await Prisma.user.findUnique({
      where: {
        name: 'admin'
      }
    })
    
    if (AdminExists) {
      console.log('Admin user already exists')
    } else {
      const _Password = 'admin'
      const _HashedPassword = await bcrypt.hash(_Password, 12)
      await Prisma.user.create({
        data: {
          name: 'admin',
          password: _HashedPassword,
          permissions: 0x7FFFFFFF // Administrator (all permissions)
        }
      })
      console.log('Admin user created successfully')
    }
    
    const GlobalSettingsExist = await Prisma.globalSettings.findUnique({
      where: { id: 1 }
    })
    
    if (GlobalSettingsExist) {
      console.log('Global settings already initialized')
    } else {
      await Prisma.globalSettings.create({
        data: {
          id: 1,
          lessonTime: 45
        }
      })
      
      console.log('Global settings initialized successfully')
    }
  } catch (Error) {
    console.error('Error during initialization:', Error)
    process.exit(1)
  } finally {
    await Prisma.$disconnect()
  }
}

InitAdmin() 