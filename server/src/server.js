require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// সাধারণ API-র জন্য অনেক বেশি generous লিমিট (শুধু abuse ঠেকানোর জন্য, normal browsing/refresh-এ যেন না লাগে)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', generalLimiter)

// শুধু admin login-এর জন্য কড়া লিমিট (brute-force protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  skipSuccessfulRequests: true, // সঠিক PIN দিলে কাউন্ট হবে না
})
app.use('/api/admin/login', loginLimiter)

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in environment variables')
  process.exit(1)
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// API routes
app.use('/api/slots', require('./routes/slots'))
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/blog', require('./routes/blog'))
app.use('/api/profile', require('./routes/profile'))
app.use('/api/practice-areas', require('./routes/practiceAreas'))
app.use('/api/admin', require('./routes/admin'))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

//cron-active
app.get('/ping', (req, res) => {
    res.status(200).send('Server is active');
});


// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
