const express = require('express')
const router = express.Router()
const Advocate = require('../models/Advocate')

// GET advocate profile
router.get('/', async (req, res) => {
  try {
    const profile = await Advocate.getProfile()
    res.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

module.exports = router
