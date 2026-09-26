const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const adminUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  pinHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'staff'],
    default: 'staff'
  },
  active: {
    type: Boolean,
    default: true
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

adminUserSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
}

adminUserSchema.methods.incrementLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    })
  }
  const updates = { $inc: { loginAttempts: 1 } }
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 } // 15 minutes
  }
  return this.updateOne(updates)
}

adminUserSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  })
}

// Ensure the owner account exists (created on first login attempt).
// The initial PIN is 123456 — the owner should change it right away.
adminUserSchema.statics.ensureOwner = async function () {
  const ownerEmail = (process.env.OWNER_EMAIL || 'tanjim.codes@gmail.com').toLowerCase()
  let owner = await this.findOne({ role: 'owner' })
  if (!owner) {
    owner = await this.create({
      email: ownerEmail,
      pinHash: await bcrypt.hash('123456', 10),
      role: 'owner',
      active: true
    })
    console.log(`Owner admin created: ${ownerEmail} (initial PIN 123456 — change it now)`)
  }
  return owner
}

module.exports = mongoose.model('AdminUser', adminUserSchema)
