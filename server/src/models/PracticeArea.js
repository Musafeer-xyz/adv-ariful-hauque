const mongoose = require('mongoose')

const practiceAreaSchema = new mongoose.Schema({
  title: {
    bn: { type: String, required: true },
    en: { type: String, required: true }
  },
  description: {
    bn: { type: String, required: true },
    en: { type: String, required: true }
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('PracticeArea', practiceAreaSchema)
