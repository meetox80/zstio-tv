const bcrypt = require('bcrypt')
const { PrismaClient } = require('../../src/generated/prisma')
const crypto = require('crypto')

const InitAdmin = async () => {
  const Prisma = new PrismaClient()
  
  try {
    const AdminExists = await Prisma.user.findUnique({
      where: {
        username: 'admin'
      }
    })
    
    if (AdminExists) {
      console.log('Admin user already exists')
    } else {
      const _SecurePassword = crypto.randomBytes(12).toString('hex')
      const _HashedPassword = await bcrypt.hash(_SecurePassword, 12)
      await Prisma.user.create({
        data: {
          username: 'admin',
          password: _HashedPassword
        }
      })
      
      console.log('==============================================')
      console.log('Admin user created successfully')
      console.log('Username: admin')
      console.log(`Password: ${_SecurePassword}`)
      console.log('SAVE THIS PASSWORD IMMEDIATELY - IT WILL ONLY BE SHOWN ONCE')
      console.log('==============================================')
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