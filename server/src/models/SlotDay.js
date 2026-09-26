const mongoose = require('mongoose')

const slotDaySchema = new mongoose.Schema({
  date: { 
    type: Date, 
    required: true,
    unique: true
  },
  label: {
    bn: { type: String, required: true },
    en: { type: String, required: true }
  },
  slots: [{
    time: { 
      type: String, 
      required: true 
    },
    available: { 
      type: Boolean, 
      default: true 
    }
  }]
}, {
  timestamps: true
})

// (date index is auto-created by unique: true — a duplicate schema.index() here
// triggered a Mongoose warning on boot)

module.exports = mongoose.model('SlotDay', slotDaySchema)
