const mongoose = require('mongoose')

const advocateSchema = new mongoose.Schema({
  name: {
    bn: { type: String, required: true },
    en: { type: String, required: true }
  },
  title: {
    bn: { type: String, required: true },
    en: { type: String, required: true }
  },
  tagline: {
    bn: { type: String, required: true },
    en: { type: String, required: true }
  },
  bio: {
    bn: { type: String, required: true },
    en: { type: String, required: true }
  },
  credentials: [{
    bn: { type: String, required: true },
    en: { type: String, required: true }
  }],
  chamber: {
    bn: { type: String, required: true },
    en: { type: String, required: true }
  },
  // e.g. "District and Session Judge's Court, Chattogram" — an attribute, not an address
  designation: {
    bn: { type: String, default: '' },
    en: { type: String, default: '' }
  },
  // Multiple chamber addresses; `chamber` above is kept for backward compatibility
  chambers: [{
    bn: { type: String, default: '' },
    en: { type: String, default: '' }
  }],
  phone: { type: String, required: true },
  whatsapp: { type: String, required: true },
  email: { type: String, required: true },
  imageUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

// There should only be one advocate document
advocateSchema.statics.getProfile = async function() {
  let profile = await this.findOne()
  if (!profile) {
    profile = await this.create({
      name: { bn: 'আপনার নাম', en: 'Your Name' },
      title: { bn: 'আইনজীবী', en: 'Advocate' },
      tagline: { bn: 'পেশাদার আইনি সেবা', en: 'Professional Legal Services' },
      bio: { 
        bn: 'আপনার বায়োগ্রাফি এখানে যোগ করুন',
        en: 'Add your biography here'
      },
      credentials: [
        { bn: 'এলএলবি (অনার্স)', en: 'LLB (Hons)' },
        { bn: 'বার কাউন্সিল সদস্য', en: 'Bar Council Member' }
      ],
      chamber: { 
        bn: 'আপনার চেম্বার ঠিকানা',
        en: 'Your Chamber Address'
      },
      designation: { bn: '', en: '' },
      chambers: [],
      phone: '+8801234567890',
      whatsapp: '+8801234567890',
      email: 'advocate@example.com',
      imageUrl: null
    })
  }
  return profile
}

module.exports = mongoose.model('Advocate', advocateSchema)
