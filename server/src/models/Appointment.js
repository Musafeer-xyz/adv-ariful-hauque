const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  // bKash/Nagad transaction ID of the manual payment
  transactionId: { type: String, default: '', trim: true },
  // The mobile number the payment was sent FROM (can differ from the client's personal number)
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
