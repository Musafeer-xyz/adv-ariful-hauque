const express = require('express')
const router = express.Router()
const Appointment = require('../models/Appointment')
const SlotDay = require('../models/SlotDay')
const { body, validationResult } = require('express-validator')

// POST create new appointment
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').trim().notEmpty().withMessage('Time is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, phone, address, subject, date, time } = req.body

    // Check if slot exists and is available
    const slotDay = await SlotDay.findOne({ date: new Date(date) })
    if (!slotDay) {
      return res.status(400).json({ error: 'No slots available for this date' })
    }

    const slot = slotDay.slots.find(s => s.time === time)
    if (!slot || !slot.available) {
      return res.status(400).json({ error: 'Slot not available' })
    }

    // Check for existing appointment at this slot
    const existingAppointment = await Appointment.findOne({
      date: new Date(date),
      time: time,
      status: { $in: ['awaiting', 'confirmed'] }
    })

    if (existingAppointment) {
      return res.status(400).json({ error: 'This slot is already booked' })
    }

    // Create appointment
    const appointment = await Appointment.create({
      name,
      phone,
      address,
      subject,
      date: new Date(date),
      time,
      payment_status: 'pending',
      status: 'awaiting'
    })

    // Mark slot as unavailable
    await SlotDay.updateOne(
      { date: new Date(date), 'slots.time': time },
      { $set: { 'slots.$.available': false } }
    )

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        name: appointment.name,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status
      }
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    res.status(500).json({ error: 'Failed to create appointment' })
  }
})

module.exports = router
