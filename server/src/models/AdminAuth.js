const mongoose = require('mongoose')

const adminAuthSchema = new mongoose.Schema({
  pinHash: { 
    type: String, 
    required: true,
    unique: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// There should only be one admin auth document
adminAuthSchema.statics.getAuth = async function() {
  let auth = await this.findOne()
  if (!auth) {
    // Default PIN is 123456
    const bcrypt = require('bcryptjs')
    const defaultPinHash = await bcrypt.hash('123456', 10)
    auth = await this.create({
      pinHash: defaultPinHash,
      loginAttempts: 0,
      lockUntil: null
    })
  }
  return auth
}

adminAuthSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now())
}

adminAuthSchema.methods.incrementLoginAttempts = function() {
  // If already locked and lock has expired, reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    })
  }
  
  // Lock after 5 failed attempts
  const updates = { $inc: { loginAttempts: 1 } }
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 } // Lock for 15 minutes
  }
  
  return this.updateOne(updates)
}

adminAuthSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  })
}

module.exports = mongoose.model('AdminAuth', adminAuthSchema)
