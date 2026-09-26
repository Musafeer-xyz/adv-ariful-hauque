const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  // Single payment reference: the bKash/Nagad TrxID OR the number the payment
  // was sent from — whichever the client has handy (kept for admin matching)
  paymentRef: { type: String, default: '', trim: true },
  // Legacy fields from the two-box version (kept so old rows still display)
  transactionId: { type: String, default: '', trim: true },
  paymentNumber: { type: String, default: '', trim: true },
  payment_status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  status: { 
    type: String, 
    enum: ['awaiting', 'confirmed', 'cancelled'],
    default: 'awaiting'
  },
  created_at: { 
    type: Date, 
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes for efficient queries
appointmentSchema.index({ date: 1, time: 1 })
appointmentSchema.index({ status: 1 })
appointmentSchema.index({ created_at: -1 })

module.exports = mongoose.model('Appointment', appointmentSchema)
