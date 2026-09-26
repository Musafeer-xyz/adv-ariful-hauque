import { useEffect, useState } from 'react'
import { adminAPI, publicAPI } from '../../services/api'
import { compressImage } from '../../utils/image'
import { Loader2, Save, Plus, Trash2, Upload, X, Lock } from 'lucide-react'

const AdminProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [pinForm, setPinForm] = useState({ currentPin: '', newPin: '', confirmPin: '' })
  const [pinMessage, setPinMessage] = useState({ type: '', text: '' })
  const [pinSaving, setPinSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: { bn: '', en: '' },
    title: { bn: '', en: '' },
    tagline: { bn: '', en: '' },
    bio: { bn: '', en: '' },
    credentials: [{ bn: '', en: '' }],
    chamber: { bn: '', en: '' },
    designation: { bn: '', en: '' },
    chambers: [],
    phone: '',
    whatsapp: '',
    email: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await publicAPI.getProfile()
        const data = response.data
        setProfile(data)
        setFormData({
          ...data,
          designation: data.designation || { bn: '', en: '' },
          chambers: Array.isArray(data.chambers) ? data.chambers : []
        })
        setPhotoPreview(data.imageUrl)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      // Keep the legacy single `chamber` in sync with the first entry of the
      // chambers list so older views keep working
      const payload = {
        ...formData,
        chamber: formData.chambers?.[0] || formData.chamber
      }
      await adminAPI.updateProfile(payload)
      const response = await publicAPI.getProfile()
      setProfile(response.data)
      setSaving(false)
      alert('Profile updated successfully!')
    } catch (err) {
      console.error('Failed to update profile:', err)
      setSaving(false)
      alert('Failed to update profile')
    }
  }

  const addCredential = () => {
    setFormData({
      ...formData,
      credentials: [...formData.credentials, { bn: '', en: '' }]
    })
  }

  const removeCredential = (index) => {
    setFormData({
      ...formData,
      credentials: formData.credentials.filter((_, i) => i !== index)
    })
  }

  const addChamber = () => {
    setFormData({
      ...formData,
      chambers: [...(formData.chambers || []), { bn: '', en: '' }]
    })
  }

  const removeChamber = (index) => {
    setFormData({
      ...formData,
      chambers: formData.chambers.filter((_, i) => i !== index)
    })
  }

  const updateChamber = (index, field, value) => {
    const newChambers = [...formData.chambers]
    newChambers[index] = { ...newChambers[index], [field]: value }
    setFormData({
      ...formData,
      chambers: newChambers
    })
  }

  const handlePinChange = async (e) => {
    e.preventDefault()
    setPinMessage({ type: '', text: '' })

    if (!/^\d{6}$/.test(pinForm.newPin)) {
      setPinMessage({ type: 'error', text: 'New PIN must be exactly 6 digits.' })
      return
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinMessage({ type: 'error', text: 'New PIN and confirmation do not match.' })
      return
    }

    try {
      setPinSaving(true)
      await adminAPI.changePin(pinForm.currentPin, pinForm.newPin)
      setPinForm({ currentPin: '', newPin: '', confirmPin: '' })
      setPinMessage({ type: 'success', text: 'PIN updated successfully. Use the new PIN next time you log in.' })
    } catch (err) {
      console.error('Failed to change PIN:', err)
      setPinMessage({ type: 'error', text: err.response?.data?.error || 'Failed to change PIN' })
    } finally {
      setPinSaving(false)
    }
  }

  const updateCredential = (index, field, value) => {
    const newCredentials = [...formData.credentials]
    newCredentials[index][field] = value
    setFormData({
      ...formData,
      credentials: newCredentials
    })
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        // Downscale/compress in the browser before sending (photos are stored
        // in the database, so keep them small)
        const compressed = await compressImage(file)
        setSelectedFile(compressed)
        setPhotoPreview(URL.createObjectURL(compressed))
        setUploadError('')
      } catch (err) {
        console.error('Image processing failed:', err)
        setUploadError(err.message || 'Could not process the selected image')
      }
    }
  }

  const handlePhotoUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      const response = await adminAPI.uploadProfilePhoto(selectedFile)
      setPhotoPreview(response.data.imageUrl)
      setSelectedFile(null)
      setUploading(false)
      
      // Refresh profile data
      const profileResponse = await publicAPI.getProfile()
      setProfile(profileResponse.data)
      setFormData(profileResponse.data)
      
      alert('Photo uploaded successfully!')
    } catch (err) {
      console.error('Failed to upload photo:', err)
      setUploading(false)
      setUploadError(err.response?.data?.error || 'Failed to upload photo')
    }
  }

  const handleRemovePhoto = () => {
    setSelectedFile(null)
    setPhotoPreview(profile?.imageUrl || null)
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
      <h1 className="text-3xl font-bold text-navy-50 mb-6">Profile Management</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        {/* Photo Upload Section */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h2 className="text-xl font-bold text-navy-50 mb-4">Profile Photo</h2>
          <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 gap-4 sm:gap-0">
            <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-4xl">⚖️</span>
                </div>
              )}
            </div>
            <div className="flex-1 w-full">
              <div className="mb-4">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center px-4 py-2 bg-navy-50 text-white rounded-lg hover:bg-navy-100 transition-colors cursor-pointer"
                >
                  <Upload size={20} className="mr-2" />
                  Choose Photo
                </label>
                {selectedFile && (
                  <button
                    onClick={handleRemovePhoto}
                    className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X size={20} className="mr-2" />
                    Remove
                  </button>
                )}
              </div>
              {selectedFile && (
                <button
                  onClick={handlePhotoUpload}
                  disabled={uploading}
                  className="inline-flex items-center px-4 py-2 bg-brass-50 text-white rounded-lg hover:bg-brass-100 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  ) : (
                    <Save className="mr-2" size={20} />
                  )}
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              )}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mt-3 max-w-md">
                  {uploadError}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Recommended: Square image, max 5MB. JPG, PNG, or WebP format.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name (English)</label>
              <input
                type="text"
                required
                value={formData.name.en}
                onChange={(e) => setFormData({...formData, name: {...formData.name, en: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name (Bengali)</label>
              <input
                type="text"
                required
                value={formData.name.bn}
                onChange={(e) => setFormData({...formData, name: {...formData.name, bn: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title (English)</label>
              <input
                type="text"
                required
                value={formData.title.en}
                onChange={(e) => setFormData({...formData, title: {...formData.title, en: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title (Bengali)</label>
              <input
                type="text"
                required
                value={formData.title.bn}
                onChange={(e) => setFormData({...formData, title: {...formData.title, bn: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tagline (English)</label>
              <input
                type="text"
                required
                value={formData.tagline.en}
                onChange={(e) => setFormData({...formData, tagline: {...formData.tagline, en: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tagline (Bengali)</label>
              <input
                type="text"
                required
                value={formData.tagline.bn}
                onChange={(e) => setFormData({...formData, tagline: {...formData.tagline, bn: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio (English)</label>
            <textarea
              required
              value={formData.bio.en}
              onChange={(e) => setFormData({...formData, bio: {...formData.bio, en: e.target.value}})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
              rows="4"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio (Bengali)</label>
            <textarea
              required
              value={formData.bio.bn}
              onChange={(e) => setFormData({...formData, bio: {...formData.bio, bn: e.target.value}})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
              rows="4"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Credentials</label>
              <button
                type="button"
                onClick={addCredential}
                className="flex items-center px-3 py-1 text-sm bg-brass-50 text-white rounded hover:bg-brass-100 transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Add
              </button>
            </div>
            {formData.credentials.map((cred, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-4 mb-3">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cred.en}
                    onChange={(e) => updateCredential(index, 'en', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent pr-10"
                    placeholder="Credential (English)"
                  />
                  {formData.credentials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCredential(index)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    required
                    value={cred.bn}
                    onChange={(e) => updateCredential(index, 'bn', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                    placeholder="Credential (Bengali)"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation (English) — e.g. court where he practices
              </label>
              <input
                type="text"
                value={formData.designation?.en || ''}
                onChange={(e) => setFormData({...formData, designation: {...formData.designation, en: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                placeholder="District and Session Judge's Court, Chattogram"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Designation (Bengali)</label>
              <input
                type="text"
                value={formData.designation?.bn || ''}
                onChange={(e) => setFormData({...formData, designation: {...formData.designation, bn: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                placeholder="জেলা ও দায়রা জজ আদালত, চট্টগ্রাম"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Chambers (add as many as needed)
              </label>
              <button
                type="button"
                onClick={addChamber}
                className="flex items-center px-3 py-1 text-sm bg-brass-50 text-white rounded hover:bg-brass-100 transition-colors"
              >
                <Plus size={16} className="mr-1" />
                Add Chamber
              </button>
            </div>
            {(formData.chambers || []).length === 0 && (
              <p className="text-sm text-gray-500 mb-2">
                No chambers added yet. These appear in the footer and Contact page.
              </p>
            )}
            {formData.chambers.map((ch, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-4 mb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={ch.en}
                    onChange={(e) => updateChamber(index, 'en', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent pr-10"
                    placeholder={`Chamber ${index + 1} (English)`}
                  />
                  {formData.chambers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => removeChamber(index)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-800"
                      aria-label="Remove chamber"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    value={ch.bn}
                    onChange={(e) => updateChamber(index, 'bn', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
                    placeholder={`চেম্বার ${index + 1} (বাংলা)`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
              <input
                type="tel"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-3 bg-navy-50 text-white rounded-lg hover:bg-navy-100 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                <Save className="mr-2" size={20} />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security: change admin PIN */}
      <div className="bg-white p-6 rounded-lg shadow mt-8">
        <h2 className="text-xl font-bold text-navy-50 mb-1 flex items-center">
          <Lock size={20} className="mr-2 text-brass-50" />
          Security
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Set or reset the 6-digit PIN used to sign in to this admin panel.
        </p>
        <form onSubmit={handlePinChange} className="max-w-md">
          {pinMessage.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${
              pinMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {pinMessage.text}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Current PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              required
              value={pinForm.currentPin}
              onChange={(e) => setPinForm({...pinForm, currentPin: e.target.value.replace(/\D/g, '')})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent tracking-widest"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">New PIN (6 digits)</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              required
              value={pinForm.newPin}
              onChange={(e) => setPinForm({...pinForm, newPin: e.target.value.replace(/\D/g, '')})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent tracking-widest"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              required
              value={pinForm.confirmPin}
              onChange={(e) => setPinForm({...pinForm, confirmPin: e.target.value.replace(/\D/g, '')})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent tracking-widest"
            />
          </div>
          <button
            type="submit"
            disabled={pinSaving}
            className="inline-flex items-center px-6 py-2.5 bg-navy-50 text-white rounded-lg hover:bg-navy-100 transition-colors disabled:opacity-50"
          >
            {pinSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Lock className="mr-2" size={18} />}
            {pinSaving ? 'Updating…' : 'Update PIN'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminProfile
