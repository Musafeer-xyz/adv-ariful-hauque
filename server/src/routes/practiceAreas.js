const express = require('express')
const router = express.Router()
const PracticeArea = require('../models/PracticeArea')

// GET all practice areas
router.get('/', async (req, res) => {
  try {
    const areas = await PracticeArea.find().sort({ title: 1 })
    res.json(areas)
  } catch (error) {
    console.error('Error fetching practice areas:', error)
    res.status(500).json({ error: 'Failed to fetch practice areas' })
  }
})

module.exports = router
