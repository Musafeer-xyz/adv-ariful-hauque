const mongoose = require('mongoose')

const blogPostSchema = new mongoose.Schema({
  slug: { 
    type: String, 
    required: true,
    unique: true
  },
  // All content fields are optional (admin may fill one language or nothing)
  title: {
    bn: { type: String, default: '' },
    en: { type: String, default: '' }
  },
  category: {
    bn: { type: String, default: '' },
    en: { type: String, default: '' }
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  excerpt: {
    bn: { type: String, default: '' },
    en: { type: String, default: '' }
  },
  body: {
    bn: { type: String, default: '' },
    en: { type: String, default: '' }
  },
  published: { 
    type: Boolean, 
    default: false 
  },
  youtubeVideo: { 
    type: String,
    default: null
  }
}, {
  timestamps: true
})

// Indexes for efficient queries
// (slug index is auto-created by unique: true — a duplicate schema.index() here
// triggered a Mongoose warning on boot)
blogPostSchema.index({ published: 1, date: -1 })
blogPostSchema.index({ category: 1 })

module.exports = mongoose.model('BlogPost', blogPostSchema)
