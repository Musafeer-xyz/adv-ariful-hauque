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
    enum: ['owner', 'developer', 'staff'],
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

// Ensure the developer account exists (the person who builds/maintains the
// site always keeps access). If the account previously existed as 'owner'
// (before the developer role was introduced) it is migrated in place — PIN
// and login history are preserved.
adminUserSchema.statics.ensureDeveloper = async function () {
  const developerEmail = (process.env.DEVELOPER_EMAIL || 'tanjim.codes@gmail.com').toLowerCase()
  let dev = await this.findOne({ email: developerEmail })
  if (!dev) {
    dev = await this.create({
      email: developerEmail,
      pinHash: await bcrypt.hash('123456', 10),
      role: 'developer',
      active: true
    })
    console.log(`Developer admin created: ${developerEmail} (initial PIN 123456 — change it now)`)
  } else if (dev.role !== 'developer') {
    dev.role = 'developer'
    await dev.save()
    console.log(`Migrated ${developerEmail} to the developer role`)
  }
  return dev
}

module.exports = mongoose.model('AdminUser', adminUserSchema)
