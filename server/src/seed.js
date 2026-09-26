require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Import models
const Advocate = require('./models/Advocate')
const PracticeArea = require('./models/PracticeArea')
const AdminAuth = require('./models/AdminAuth')
const AdminUser = require('./models/AdminUser')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in environment variables')
  process.exit(1)
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing data (optional - comment out if you want to preserve data)
    // await Advocate.deleteMany({})
    // await PracticeArea.deleteMany({})
    // await AdminAuth.deleteMany({})

    // Create or get advocate profile
    console.log('Seeding Advocate profile...')
    const advocate = await Advocate.getProfile()
    console.log('Advocate profile created/updated')

    // Create sample practice areas
    console.log('Seeding Practice Areas...')
    const practiceAreas = [
      {
        title: { bn: 'পারিবারিক আইন', en: 'Family Law' },
        description: { 
          bn: 'বিবাহ, তালাক, সন্তানের অভিভাবকত্ব এবং পারিবারিক সম্পত্তি বিষয়ক আইনি সেবা',
          en: 'Legal services for marriage, divorce, child custody, and family property matters'
        }
      },
      {
        title: { bn: 'সম্পত্তি আইন', en: 'Property Law' },
        description: { 
          bn: 'সম্পত্তি ক্রয়-বিক্রয়, জমি রেজিস্ট্রেশন এবং সম্পত্তি বিরোধ সমাধান',
          en: 'Property purchase/sale, land registration, and property dispute resolution'
        }
      },
      {
        title: { bn: 'ফৌজদারি আইন', en: 'Criminal Law' },
        description: { 
          bn: 'ফৌজদারি মামলা, জামিন এবং আপিল সংক্রান্ত আইনি সহায়তা',
          en: 'Legal assistance for criminal cases, bail, and appeals'
        }
      },
      {
        title: { bn: 'কর্পোরেট আইন', en: 'Corporate Law' },
        description: { 
          bn: 'কোম্পানি নিবন্ধন, চুক্তি এবং কর্পোরেট মামলা',
          en: 'Company registration, contracts, and corporate litigation'
        }
      }
    ]

    for (const area of practiceAreas) {
      await PracticeArea.findOneAndUpdate(
        { 'title.en': area.title.en },
        area,
        { upsert: true, new: true }
      )
    }
    console.log('Practice Areas seeded')

    // Create admin auth (legacy) + owner admin user
    console.log('Seeding Admin Auth...')
    const adminAuth = await AdminAuth.getAuth()
    console.log('Admin Auth created/updated')
    console.log('Default PIN: 123456 (change this in production)')

    console.log('Seeding developer admin user...')
    const dev = await AdminUser.ensureDeveloper()
    console.log(`Developer account ready: ${dev.email} (${dev.role})`)

    console.log('Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
