const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const AdminAuth = require('../models/AdminAuth')
const Appointment = require('../models/Appointment')
const SlotDay = require('../models/SlotDay')
const BlogPost = require('../models/BlogPost')
const Advocate = require('../models/Advocate')
const authMiddleware = require('../middleware/auth')
const loginRateLimiter = require('../middleware/loginRateLimit')
const NotificationService = require('../services/notificationService')
const upload = require('../middleware/upload')

const notificationService = new NotificationService()

// POST admin login
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { pin, rememberDevice } = req.body

    if (!pin || pin.length !== 6) {
      return res.status(400).json({ error: 'Invalid PIN format' })
    }

    const auth = await AdminAuth.getAuth()

    // Check if account is locked
    if (auth.isLocked()) {
      return res.status(429).json({ 
        error: 'Account temporarily locked due to too many failed attempts' 
      })
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, auth.pinHash)

    if (!isValid) {
      await auth.incrementLoginAttempts()
      return res.status(401).json({ error: 'Invalid PIN' })
    }

    // Reset login attempts on successful login
    await auth.resetLoginAttempts()

    // Create JWT token
    const token = jwt.sign(
      { id: auth._id },
      process.env.JWT_SECRET,
      { expiresIn: rememberDevice ? '30d' : '24h' }
    )

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberDevice ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    })

    res.json({ message: 'Login successful' })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// POST admin logout
router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logout successful' })
})

// PUT change admin PIN (admin sets/resets their own PIN from the Profile page)
router.put('/change-pin', authMiddleware, async (req, res) => {
  try {
    const { currentPin, newPin } = req.body

    if (!currentPin || !newPin) {
      return res.status(400).json({ error: 'Current PIN and new PIN are required' })
    }
    if (!/^\d{6}$/.test(newPin)) {
      return res.status(400).json({ error: 'New PIN must be exactly 6 digits' })
    }

    const auth = await AdminAuth.getAuth()

    const isCurrentValid = await bcrypt.compare(currentPin, auth.pinHash)
    if (!isCurrentValid) {
      return res.status(401).json({ error: 'Current PIN is incorrect' })
    }

    const isSame = await bcrypt.compare(newPin, auth.pinHash)
    if (isSame) {
      return res.status(400).json({ error: 'New PIN must be different from the current PIN' })
    }

    auth.pinHash = await bcrypt.hash(newPin, 10)
    await auth.save()

    res.json({ message: 'PIN updated successfully' })
  } catch (error) {
    console.error('Error changing PIN:', error)
    res.status(500).json({ error: 'Failed to change PIN' })
  }
})

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
