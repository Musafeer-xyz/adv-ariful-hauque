import { useLanguage } from '../context/LanguageContext'
import { useState, useEffect } from 'react'
import { publicAPI } from '../services/api'
import { Calendar, Clock, User, Phone, MapPin, CheckCircle, Loader2 } from 'lucide-react'
import { districts } from '../constants/districts'

const Appointment = () => {
  const { language } = useLanguage()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [slots, setSlots] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [practiceAreas, setPracticeAreas] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    subject: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Generate next 7 days for date selection
    const dates = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      })
    }
    setAvailableDates(dates)
  }, [language])

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate)
    }
  }, [selectedDate])

  useEffect(() => {
    publicAPI.getPracticeAreas()
      .then((res) => setPracticeAreas(res.data))
      .catch((err) => console.error('Failed to load practice areas:', err))
  }, [])

  const fetchSlots = async (date) => {
    try {
      setLoading(true)
      const response = await publicAPI.getSlots(date)
      setSlots(response.data.slots || [])
      setLoading(false)
    } catch (err) {
      setError('Failed to load available slots')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedDate || !selectedTime) {
      setError('Please select date and time')
      return
    }

    if (!formData.name || !formData.phone || !formData.address || !formData.subject) {
      setError('Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      await publicAPI.createAppointment({
        ...formData,
        date: selectedDate,
        time: selectedTime
      })
      setSuccess(true)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment')
      setLoading(false)
    }
  }

  const content = {
    en: {
      title: 'Book Appointment',
      subtitle: 'Schedule your consultation',
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      personalInfo: 'Personal Information',
      name: 'Full Name',
      phone: 'Phone Number',
      address: 'District',
      selectDistrict: 'Select district',
      subject: 'Subject/Practice Area',
      selectSubject: 'Select a subject',
      paymentInfo: 'Payment Information',
      paymentInstructions: 'Please send payment to:',
      bkash: 'bKash: 01712345678',
      nagad: 'Nagad: 01812345678',
      afterPayment: 'After payment, submit this form with your details.',
      submit: 'Book Appointment',
      back: 'Back',
      next: 'Next',
      success: 'Appointment Booked Successfully!',
      successMessage: 'Your appointment has been booked and is awaiting confirmation. We will contact you after payment verification.',
      noSlots: 'No slots available for this date',
      required: 'Required',
    },
    bn: {
      title: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      subtitle: 'আপনার পরামর্শ নির্ধারণ করুন',
      selectDate: 'তারিখ নির্বাচন করুন',
      selectTime: 'সময় নির্বাচন করুন',
      personalInfo: 'ব্যক্তিগত তথ্য',
      name: 'পূর্ণ নাম',
      phone: 'ফোন নম্বর',
      address: 'জেলা',
      selectDistrict: 'জেলা নির্বাচন করুন',
      subject: 'বিষয়/অভ্যাস ক্ষেত্র',
      selectSubject: 'একটি বিষয় নির্বাচন করুন',
      paymentInfo: 'পেমেন্ট তথ্য',
      paymentInstructions: 'অনুগ্রহ করে পেমেন্ট পাঠান:',
      bkash: 'বিকাশ: 01712345678',
      nagad: 'নগদ: 01812345678',
      afterPayment: 'পেমেন্টের পরে, আপনার বিস্তারিত সহ এই ফর্মটি জমা দিন।',
      submit: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      back: 'পিছনে',
      next: 'পরবর্তী',
      success: 'অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে!',
      successMessage: 'আপনার অ্যাপয়েন্টমেন্ট বুক হয়েছে এবং নিশ্চিতকরণের অপেক্ষায় আছে। পেমেন্ট যাচাইয়ের পরে আমরা আপনার সাথে যোগাযোগ করব।',
      noSlots: 'এই তারিখের জন্য কোনো স্লট নেই',
      required: 'প্রয়োজনীয়',
    }
  }

  const c = content[language]

  if (success) {
    return (
      <div className="py-16 bg-background-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow text-center">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
            <h1 className="text-3xl font-bold text-navy-50 mb-4">{c.success}</h1>
            <p className="text-gray-600 mb-6">{c.successMessage}</p>
            <button
              onClick={() => {
                setSuccess(false)
                setStep(1)
                setSelectedDate('')
                setSelectedTime('')
                setFormData({ name: '', phone: '', address: '', subject: '' })
              }}
              className="px-6 py-3 bg-navy-50 text-white rounded hover:bg-navy-100 transition-colors"
            >
              {language === 'en' ? 'Book Another Appointment' : 'আরেকটি অ্যাপয়েন্টমেন্ট বুক করুন'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-background-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-navy-50 mb-2">{c.title}</h1>
        <p className="text-xl text-brass-50 mb-8">{c.subtitle}</p>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Date & Time Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-navy-50 mb-6 flex items-center">
                <Calendar className="mr-2" size={24} />
                {c.selectDate}
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {c.selectDate}
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                >
                  <option value="">{language === 'en' ? 'Choose a date' : 'একটি তারিখ চয়ন করুন'}</option>
                  {availableDates.map((date) => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {c.selectTime}
                  </label>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin text-brass-50" size={32} />
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-gray-500">{c.noSlots}</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                      {slots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`px-2 sm:px-4 min-h-[44px] rounded-lg border-2 transition-colors ${
                            selectedTime === slot.time
                              ? 'border-brass-50 bg-brass-50 text-white'
                              : 'border-gray-300 hover:border-brass-50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedTime && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-navy-50 text-white py-3 rounded-lg hover:bg-navy-100 transition-colors"
                >
                  {c.next}
                </button>
              )}
            </div>
          )}

          {/* Step 2: Personal Information */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-bold text-navy-50 mb-6 flex items-center">
                <User className="mr-2" size={24} />
                {c.personalInfo}
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {c.name} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {c.phone} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {c.address} <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                  >
                    <option value="">{c.selectDistrict}</option>
                    {districts.map((d) => (
                      <option key={d.en} value={d.en}>
                        {language === 'bn' ? d.bn : d.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {c.subject} <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                  >
                    <option value="">{c.selectSubject}</option>
                    {practiceAreas.map((area) => {
                      const enLabel = area.title?.en || area.title
                      const bnLabel = area.title?.bn || area.title
                      return (
                        <option key={area._id || enLabel} value={enLabel}>
                          {language === 'bn' ? bnLabel : enLabel}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-background-100 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-bold text-navy-50 mb-4 flex items-center">
                  <Clock className="mr-2" size={20} />
                  {c.paymentInfo}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{c.paymentInstructions}</p>
                <div className="space-y-2 text-sm">
                  <p><strong>bKash:</strong> 01712345678</p>
                  <p><strong>Nagad:</strong> 01812345678</p>
                </div>
                <p className="text-sm text-gray-600 mt-3">{c.afterPayment}</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-navy-50 text-navy-50 rounded-lg hover:bg-navy-50 hover:text-white transition-colors"
                >
                  {c.back}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-navy-50 text-white py-3 rounded-lg hover:bg-navy-100 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    c.submit
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Appointment