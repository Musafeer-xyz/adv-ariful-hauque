import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import { Loader2, AlertCircle } from 'lucide-react'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [rememberDevice, setRememberDevice] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (pin.length !== 6) {
      setError('Please enter a 6-digit PIN')
      return
    }

    try {
      setLoading(true)
      await adminAPI.login(email || undefined, pin, rememberDevice)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
      setLoading(false)
    }
  }

  const handlePinChange = (value) => {
    if (value.length <= 6) {
      setPin(value)
    }
  }

  return (
    <div className="min-h-screen bg-background-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-navy-50 mb-6 text-center">
          Admin Login
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-gray-400 font-normal">(owner & staff accounts)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
              placeholder="you@example.com"
              autoComplete="username"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit PIN
            </label>
            <input
              type="password"
              maxLength="6"
              value={pin}
              onChange={(e) => handlePinChange(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent text-center text-2xl tracking-widest"
              placeholder="••••••"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center py-3 -my-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-5 h-5 text-brass-50 border-gray-300 rounded focus:ring-brass-50"
              />
              <span className="ml-2 text-sm text-gray-700">Remember this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy-50 text-white py-3 rounded-lg hover:bg-navy-100 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Default PIN: 123456</p>
          <p className="text-xs mt-1">Change this after first login</p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
