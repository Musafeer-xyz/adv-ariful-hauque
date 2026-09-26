const express = require('express')
const router = express.Router()
const SlotDay = require('../models/SlotDay')

// GET available slots for a specific date
router.get('/', async (req, res) => {
  try {
    const { date } = req.query

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' })
    }

    const queryDate = new Date(date)
    const slotDay = await SlotDay.findOne({ date: queryDate })

    if (!slotDay) {
      return res.json({ date, slots: [] })
    }

    // Return only available slots
    const availableSlots = slotDay.slots.filter(slot => slot.available)
    
    res.json({
      date: slotDay.date,
      label: slotDay.label,
      slots: availableSlots
    })
  } catch (error) {
    console.error('Error fetching slots:', error)
    res.status(500).json({ error: 'Failed to fetch slots' })
  }
})

module.exports = router
