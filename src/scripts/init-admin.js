const bcrypt = require('bcrypt')
const { PrismaClient } = require('../../src/generated/prisma')

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
      return
    }

    const HashedPassword = await bcrypt.hash('admin', 10)
    await Prisma.user.create({
      data: {
        username: 'admin',
        password: HashedPassword
      }
    })
    
    console.log('Admin user created successfully')
  } catch (Error) {
    console.error('Error initializing admin user:', Error)
    process.exit(1)
  } finally {
    await Prisma.$disconnect()
  }
}

InitAdmin() 