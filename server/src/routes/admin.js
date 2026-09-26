const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const AdminAuth = require('../models/AdminAuth')
const AdminUser = require('../models/AdminUser')
const Appointment = require('../models/Appointment')
const SlotDay = require('../models/SlotDay')
const BlogPost = require('../models/BlogPost')
const Advocate = require('../models/Advocate')
const authMiddleware = require('../middleware/auth')
const loginRateLimiter = require('../middleware/loginRateLimit')
const NotificationService = require('../services/notificationService')
const upload = require('../middleware/upload')

const notificationService = new NotificationService()

// POST admin login (email + PIN; legacy PIN-only still accepted while AdminAuth exists)
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { email, pin, rememberDevice } = req.body

    if (!pin || pin.length !== 6) {
      return res.status(400).json({ error: 'Invalid PIN format' })
    }

    let user = null
    if (email) {
      user = await AdminUser.findOne({ email: String(email).toLowerCase().trim() })
      if (!user) {
        return res.status(401).json({ error: 'No admin account with that email' })
      }
      if (!user.active) {
        return res.status(403).json({ error: 'This account has been deactivated' })
      }
      if (user.isLocked()) {
        return res.status(429).json({ error: 'Account temporarily locked due to too many failed attempts' })
      }
      const valid = await bcrypt.compare(pin, user.pinHash)
      if (!valid) {
        await user.incrementLoginAttempts()
        return res.status(401).json({ error: 'Invalid email or PIN' })
      }
      await user.resetLoginAttempts()
    } else {
      // Legacy path: old shared-PIN login (kept until all admins have accounts)
      const auth = await AdminAuth.getAuth()
      if (auth.isLocked()) {
        return res.status(429).json({ error: 'Account temporarily locked due to too many failed attempts' })
      }
      const valid = await bcrypt.compare(pin, auth.pinHash)
      if (!valid) {
        await auth.incrementLoginAttempts()
        return res.status(401).json({ error: 'Invalid PIN' })
      }
      await auth.resetLoginAttempts()
    }

    const token = jwt.sign(
      { id: user ? user._id.toString() : (await AdminAuth.getAuth())._id.toString(), role: user ? user.role : 'owner' },
      process.env.JWT_SECRET,
      { expiresIn: rememberDevice ? '30d' : '24h' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberDevice ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    })

    res.json({
      message: 'Login successful',
      role: user ? user.role : 'owner',
      email: user ? user.email : null
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET current admin (who am I)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await AdminUser.findById(req.adminId)
    if (user) {
      return res.json({ email: user.email, role: user.role, source: 'user' })
    }
    // Legacy shared-PIN session
    const legacy = await AdminAuth.findById(req.adminId)
    if (legacy) {
      return res.json({ email: null, role: 'owner', source: 'legacy' })
    }
    res.status(404).json({ error: 'Account not found' })
  } catch (error) {
    console.error('Error fetching current admin:', error)
    res.status(500).json({ error: 'Failed to fetch current admin' })
  }
})

// PUT change my own PIN (any signed-in admin, both account types)
router.put('/me/pin', authMiddleware, async (req, res) => {
  try {
    const { currentPin, newPin } = req.body
    if (!currentPin || !newPin) {
      return res.status(400).json({ error: 'Current PIN and new PIN are required' })
    }
    if (!/^\d{6}$/.test(newPin)) {
      return res.status(400).json({ error: 'New PIN must be exactly 6 digits' })
    }

    const user = await AdminUser.findById(req.adminId)
    if (user) {
      const ok = await bcrypt.compare(currentPin, user.pinHash)
      if (!ok) {
        return res.status(401).json({ error: 'Current PIN is incorrect' })
      }
      if (await bcrypt.compare(newPin, user.pinHash)) {
        return res.status(400).json({ error: 'New PIN must be different from the current PIN' })
      }
      user.pinHash = await bcrypt.hash(newPin, 10)
      await user.save()
      return res.json({ message: 'PIN updated successfully' })
    }

    const legacy = await AdminAuth.findById(req.adminId)
    if (legacy) {
      const ok = await bcrypt.compare(currentPin, legacy.pinHash)
      if (!ok) {
        return res.status(401).json({ error: 'Current PIN is incorrect' })
      }
      if (await bcrypt.compare(newPin, legacy.pinHash)) {
        return res.status(400).json({ error: 'New PIN must be different from the current PIN' })
      }
      legacy.pinHash = await bcrypt.hash(newPin, 10)
      await legacy.save()
      return res.json({ message: 'PIN updated successfully' })
    }

    res.status(404).json({ error: 'Account not found' })
  } catch (error) {
    console.error('Error changing own PIN:', error)
    res.status(500).json({ error: 'Failed to change PIN' })
  }
})

// ---- Team management (owner only) ----

const requireOwner = async (req, res, next) => {
  try {
    const user = await AdminUser.findById(req.adminId)
    const isOwner = (user && user.role === 'owner') ||
      (!user && (await AdminAuth.findById(req.adminId))) // legacy session counts as owner
    if (!isOwner) {
      return res.status(403).json({ error: 'Only the owner can manage admin users' })
    }
    next()
  } catch (error) {
    console.error('Error checking owner:', error)
    res.status(500).json({ error: 'Authorization failed' })
  }
}

// GET list admin users
router.get('/users', authMiddleware, requireOwner, async (req, res) => {
  try {
    const users = await AdminUser.find().sort({ createdAt: 1 })
    res.json(users.map(u => ({
      id: u._id,
      email: u.email,
      role: u.role,
      active: u.active,
      createdAt: u.createdAt
    })))
  } catch (error) {
    console.error('Error listing admin users:', error)
    res.status(500).json({ error: 'Failed to list admin users' })
  }
})

// POST create admin user
router.post('/users', authMiddleware, requireOwner, async (req, res) => {
  try {
    const { email, pin, role } = req.body
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email is required' })
    }
    if (!/^\d{6}$/.test(pin || '')) {
      return res.status(400).json({ error: 'PIN must be exactly 6 digits' })
    }
    const normalizedEmail = String(email).toLowerCase().trim()
    const exists = await AdminUser.findOne({ email: normalizedEmail })
    if (exists) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }
    const user = await AdminUser.create({
      email: normalizedEmail,
      pinHash: await bcrypt.hash(pin, 10),
      role: role === 'owner' ? 'owner' : 'staff'
    })
    res.status(201).json({ id: user._id, email: user.email, role: user.role, active: user.active })
  } catch (error) {
    console.error('Error creating admin user:', error)
    res.status(500).json({ error: 'Failed to create admin user' })
  }
})

// PUT reset a user's PIN (owner sets a temporary PIN; the user should change it after)
router.put('/users/:id/pin', authMiddleware, requireOwner, async (req, res) => {
  try {
    const { pin } = req.body
    if (!/^\d{6}$/.test(pin || '')) {
      return res.status(400).json({ error: 'PIN must be exactly 6 digits' })
    }
    const user = await AdminUser.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    user.pinHash = await bcrypt.hash(pin, 10)
    user.loginAttempts = 0
    user.lockUntil = null
    await user.save()
    res.json({ message: `PIN reset for ${user.email}` })
    
  } catch (error) {
    console.error('Error resetting user PIN:', error)
    res.status(500).json({ error: 'Failed to reset PIN' })
  }
})

// PUT activate/deactivate a user
router.put('/users/:id/active', authMiddleware, requireOwner, async (req, res) => {
  try {
    const { active } = req.body
    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'active must be true or false' })
    }
    const user = await AdminUser.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    if (user.role === 'owner' && !active) {
      return res.status(400).json({ error: 'The owner account cannot be deactivated' })
    }
    user.active = active
    await user.save()
    res.json({ message: `${user.email} is now ${active ? 'active' : 'deactivated'}` })
  } catch (error) {
    console.error('Error updating user status:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// DELETE a user
router.delete('/users/:id', authMiddleware, requireOwner, async (req, res) => {
  try {
    const user = await AdminUser.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    if (user.role === 'owner') {
      return res.status(400).json({ error: 'The owner account cannot be deleted' })
    }
    await user.deleteOne()
    res.json({ message: `${user.email} removed` })
  } catch (error) {
    console.error('Error deleting admin user:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// POST admin logout
router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logout successful' })
})

// PUT change admin PIN — moved to /me/pin (works for both owner and staff accounts)

// GET admin dashboard stats
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments()
    const awaitingAppointments = await Appointment.countDocuments({ status: 'awaiting' })
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' })
    const activeSlotDays = await SlotDay.countDocuments({ date: { $gte: new Date() } })
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    })

    res.json({
      totalAppointments,
      awaitingAppointments,
      confirmedAppointments,
      activeSlotDays,
      todayAppointments
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})

// GET all appointments with filters
router.get('/appointments', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query
    const filter = (status && status !== 'all') ? { status } : {}
    
    const appointments = await Appointment.find(filter)
      .sort({ created_at: -1 })
    
    res.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    res.status(500).json({ error: 'Failed to fetch appointments' })
  }
})

// PATCH confirm appointment
router.patch('/appointments/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'confirmed',
        payment_status: 'paid'
      },
      { new: true }
    )

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' })
    }

    // Send confirmation notification
    await notificationService.sendAppointmentConfirmation(appointment)

    res.json({ message: 'Appointment confirmed', appointment })
  } catch (error) {
    console.error('Error confirming appointment:', error)
    res.status(500).json({ error: 'Failed to confirm appointment' })
  }
})

// PATCH cancel appointment
router.patch('/appointments/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    )

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' })
    }

    // Make the slot available again
    await SlotDay.updateOne(
      { date: appointment.date, 'slots.time': appointment.time },
      { $set: { 'slots.$.available': true } }
    )

    // Send cancellation notification
    await notificationService.sendAppointmentCancellation(appointment)

    res.json({ message: 'Appointment cancelled', appointment })
  } catch (error) {
    console.error('Error cancelling appointment:', error)
    res.status(500).json({ error: 'Failed to cancel appointment' })
  }
})

// GET all slot days
router.get('/slots', authMiddleware, async (req, res) => {
  try {
    const slotDays = await SlotDay.find().sort({ date: 1 })
    res.json(slotDays)
  } catch (error) {
    console.error('Error fetching slots:', error)
    res.status(500).json({ error: 'Failed to fetch slots' })
  }
})

// POST create new slot day
router.post('/slots', authMiddleware, async (req, res) => {
  try {
    const { date, label, slots } = req.body

    const slotDay = await SlotDay.create({
      date: new Date(date),
      label,
      slots: slots.map(time => ({ time, available: true }))
    })

    res.status(201).json(slotDay)
  } catch (error) {
    console.error('Error creating slot day:', error)
    res.status(500).json({ error: 'Failed to create slot day' })
  }
})

// PATCH toggle slot availability
router.patch('/slots/:date/:time/toggle', authMiddleware, async (req, res) => {
  try {
    const { date, time } = req.params

    const slotDay = await SlotDay.findOne({ date: new Date(date) })
    if (!slotDay) {
      return res.status(404).json({ error: 'Slot day not found' })
    }

    const slot = slotDay.slots.find(s => s.time === time)
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' })
    }

    // Toggle availability
    await SlotDay.updateOne(
      { date: new Date(date), 'slots.time': time },
      { $set: { 'slots.$.available': !slot.available } }
    )

    res.json({ message: 'Slot toggled successfully' })
  } catch (error) {
    console.error('Error toggling slot:', error)
    res.status(500).json({ error: 'Failed to toggle slot' })
  }
})

// DELETE slot
router.delete('/slots/:date/:time', authMiddleware, async (req, res) => {
  try {
    const { date, time } = req.params

    await SlotDay.updateOne(
      { date: new Date(date) },
      { $pull: { slots: { time } } }
    )

    res.json({ message: 'Slot deleted successfully' })
  } catch (error) {
    console.error('Error deleting slot:', error)
    res.status(500).json({ error: 'Failed to delete slot' })
  }
})

// GET all blog posts (including drafts)
router.get('/blog', authMiddleware, async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ date: -1 })
    res.json(posts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    res.status(500).json({ error: 'Failed to fetch blog posts' })
  }
})

// POST create blog post
router.post('/blog', authMiddleware, async (req, res) => {
  try {
    const post = await BlogPost.create(req.body)
    res.status(201).json(post)
  } catch (error) {
    console.error('Error creating blog post:', error)
    res.status(500).json({ error: 'Failed to create blog post' })
  }
})

// PUT update blog post
router.put('/blog/:slug', authMiddleware, async (req, res) => {
  try {
    const post = await BlogPost.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true }
    )

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' })
    }

    res.json(post)
  } catch (error) {
    console.error('Error updating blog post:', error)
    res.status(500).json({ error: 'Failed to update blog post' })
  }
})

// DELETE blog post
router.delete('/blog/:slug', authMiddleware, async (req, res) => {
  try {
    const post = await BlogPost.findOneAndDelete({ slug: req.params.slug })

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' })
    }

    res.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    res.status(500).json({ error: 'Failed to delete blog post' })
  }
})

// PUT update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await Advocate.getProfile()
    
    Object.assign(profile, req.body)
    await profile.save()

    res.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// POST upload profile photo — stored as a data URL directly in MongoDB
// (no Cloudinary account and no local disk needed, so it survives Render restarts)
router.post('/profile/photo', authMiddleware, (req, res) => {
  upload.single('photo')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err)
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
      return res.status(status).json({ error: err.message || 'Upload failed' })
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      // Safety net: the client compresses to a small JPEG, but reject huge
      // payloads so a single profile photo can never bloat the database.
      if (req.file.buffer.length > 1.5 * 1024 * 1024) {
        return res.status(413).json({ error: 'Image too large after processing. Please use a smaller photo.' })
      }

      const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`

      const profile = await Advocate.getProfile()
      profile.imageUrl = dataUrl
      await profile.save()

      res.json({
        message: 'Photo uploaded successfully',
        imageUrl: profile.imageUrl
      })
    } catch (error) {
      console.error('Error uploading photo:', error)
      res.status(500).json({ error: 'Failed to upload photo' + (error.message ? `: ${error.message}` : '') })
    }
  })
})

module.exports = router
