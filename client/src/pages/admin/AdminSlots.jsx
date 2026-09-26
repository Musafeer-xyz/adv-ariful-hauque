import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Calendar as CalendarIcon } from 'lucide-react'

const WEEKDAYS = [
  { en: 'Saturday', bn: 'শনিবার' },
  { en: 'Sunday', bn: 'রবিবার' },
  { en: 'Monday', bn: 'সোমবার' },
  { en: 'Tuesday', bn: 'মঙ্গলবার' },
  { en: 'Wednesday', bn: 'বুধবার' },
  { en: 'Thursday', bn: 'বৃহস্পতিবার' },
  { en: 'Friday', bn: 'শুক্রবার' }
]

const AdminSlots = () => {
  const [slotDays, setSlotDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSlotDay, setNewSlotDay] = useState({
    date: '',
    label: { bn: '', en: '' },
    slots: ''
  })

  // Derive the weekday from the chosen date and auto-fill both labels
  const handleDateChange = (dateValue) => {
    let weekday = null
    if (dateValue) {
      // Parse as local midnight to avoid timezone shifting the weekday
      const [y, m, d] = dateValue.split('-').map(Number)
      weekday = new Date(y, m - 1, d).getDay()
    }
    setNewSlotDay((prev) => ({
      ...prev,
      date: dateValue,
      label: weekday === null
        ? { bn: '', en: '' }
        : { bn: WEEKDAYS[weekday].bn, en: WEEKDAYS[weekday].en }
    }))
  }

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await adminAPI.getSlots()
        setSlotDays(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch slots:', err)
        setLoading(false)
      }
    }

    fetchSlots()
  }, [])

  const handleCreateSlotDay = async (e) => {
    e.preventDefault()
    try {
      const slotsArray = newSlotDay.slots.split(',').map(s => s.trim()).filter(s => s)
      await adminAPI.createSlotDay({
        date: newSlotDay.date,
        label: newSlotDay.label,
        slots: slotsArray
      })
      const response = await adminAPI.getSlots()
      setSlotDays(response.data)
      setShowCreateForm(false)
      setNewSlotDay({ date: '', label: { bn: '', en: '' }, slots: '' })
    } catch (err) {
      console.error('Failed to create slot day:', err)
    }
  }

  const handleToggleSlot = async (date, time) => {
    try {
      await adminAPI.toggleSlot(date, time)
      const response = await adminAPI.getSlots()
      setSlotDays(response.data)
    } catch (err) {
      console.error('Failed to toggle slot:', err)
    }
  }

  const handleDeleteSlot = async (date, time) => {
    if (!confirm('Are you sure you want to delete this slot?')) return
    
    try {
      await adminAPI.deleteSlot(date, time)
      const response = await adminAPI.getSlots()
      setSlotDays(response.data)
    } catch (err) {
      console.error('Failed to delete slot:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-brass-50" size={48} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-navy-50">Slot Management</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center justify-center px-4 py-2 min-h-[44px] bg-navy-50 text-white rounded-lg hover:bg-navy-100 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add New Day
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold text-navy-50 mb-4">Create New Slot Day</h2>
          <form onSubmit={handleCreateSlotDay}>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={newSlotDay.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label (English)</label>
                <select
                  value={newSlotDay.label.en}
                  onChange={(e) => setNewSlotDay({...newSlotDay, label: {...newSlotDay.label, en: e.target.value}})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                >
                  <option value="">Select a day</option>
                  {WEEKDAYS.map((d) => (
                    <option key={d.en} value={d.en}>{d.en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label (Bengali)</label>
                <select
                  value={newSlotDay.label.bn}
                  onChange={(e) => setNewSlotDay({...newSlotDay, label: {...newSlotDay.label, bn: e.target.value}})
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                >
                  <option value="">দিন নির্বাচন করুন</option>
                  {WEEKDAYS.map((d) => (
                    <option key={d.bn} value={d.bn}>{d.bn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Slots (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={newSlotDay.slots}
                  onChange={(e) => setNewSlotDay({...newSlotDay, slots: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                  placeholder="09:00, 10:00, 11:00, 14:00, 15:00"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-navy-50 text-white rounded-lg hover:bg-navy-100 transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {slotDays.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No slot days created yet
          </div>
        ) : (
          slotDays.map((slotDay) => (
            <div key={slotDay._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-navy-50 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CalendarIcon size={20} />
                  <div>
                    <h3 className="font-bold">{slotDay.label.en} / {slotDay.label.bn}</h3>
                    <p className="text-sm opacity-80">{new Date(slotDay.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-sm bg-brass-50 px-3 py-1 rounded-full">
                  {slotDay.slots.length} slots
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {slotDay.slots.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 flex items-center justify-between ${
                        slot.available 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-red-300 bg-red-50'
                      }`}
                    >
                      <span className="font-medium">{slot.time}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleToggleSlot(slotDay.date, slot.time)}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 hover:bg-white rounded transition-colors"
                          title={slot.available ? 'Mark unavailable' : 'Mark available'}
                          aria-label={slot.available ? 'Mark unavailable' : 'Mark available'}
                        >
                          {slot.available ? <ToggleRight size={20} className="text-green-600" /> : <ToggleLeft size={20} className="text-red-600" />}
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slotDay.date, slot.time)}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 hover:bg-white rounded transition-colors"
                          title="Delete slot"
                          aria-label="Delete slot"
                        >
                          <Trash2 size={20} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminSlots
