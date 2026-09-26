import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { Loader2, UserPlus, Trash2, KeyRound, ShieldCheck, Power } from 'lucide-react'

const AdminTeam = () => {
  const [users, setUsers] = useState([])
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [newUser, setNewUser] = useState({ email: '', pin: '' })
  const [creating, setCreating] = useState(false)
  const [resetFor, setResetFor] = useState(null) // user id being PIN-reset
  const [resetPin, setResetPin] = useState('')

  const load = async () => {
    try {
      const [usersRes, meRes] = await Promise.all([adminAPI.getUsers(), adminAPI.me()])
      setUsers(usersRes.data)
      setMe(meRes.data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load team:', err)
      setError(err.response?.data?.error || 'Failed to load team')
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!/^\d{6}$/.test(newUser.pin)) {
      setError('PIN must be exactly 6 digits')
      return
    }
    try {
      setCreating(true)
      const res = await adminAPI.createUser(newUser.email, newUser.pin)
      setMessage(`Account created for ${res.data.email} — share the email and PIN with them.`)
      setNewUser({ email: '', pin: '' })
      await load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  const handleResetPin = async (userId) => {
    setError('')
    setMessage('')
    if (!/^\d{6}$/.test(resetPin)) {
      setError('PIN must be exactly 6 digits')
      return
    }
    try {
      const res = await adminAPI.resetUserPin(userId, resetPin)
      setMessage(res.data.message + '. Share the temporary PIN — they should change it after login.')
      setResetFor(null)
      setResetPin('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset PIN')
    }
  }

  const handleToggleActive = async (user) => {
    setError('')
    setMessage('')
    try {
      const res = await adminAPI.setUserActive(user.id, !user.active)
      setMessage(res.data.message)
      await load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user')
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Remove ${user.email}'s admin access permanently?`)) return
    setError('')
    setMessage('')
    try {
      const res = await adminAPI.deleteUser(user.id)
      setMessage(res.data.message)
      await load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user')
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
      <h1 className="text-3xl font-bold text-navy-50 mb-2">Team</h1>
      <p className="text-gray-600 mb-6">
        Create admin accounts for people you trust. They can do everything except manage this page,
        and can change their own PIN after signing in.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">{error}</div>
      )}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4">{message}</div>
      )}

      {/* Create user */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold text-navy-50 mb-4 flex items-center">
          <UserPlus size={20} className="mr-2 text-brass-50" />
          Create Admin Account
        </h2>
        <form onSubmit={handleCreate} className="grid md:grid-cols-[2fr_1fr_auto] gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
              placeholder="colleague@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Initial PIN (6 digits)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={newUser.pin}
              onChange={(e) => setNewUser({ ...newUser, pin: e.target.value.replace(/\D/g, '') })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent tracking-widest"
              placeholder="••••••"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] bg-navy-50 text-white rounded-lg hover:bg-navy-100 transition-colors disabled:opacity-50"
          >
            {creating ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} className="mr-0 sm:mr-2" />}
            <span className="hidden sm:inline">{creating ? 'Creating…' : 'Create'}</span>
          </button>
        </form>
      </div>

      {/* Users list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-50 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {user.email}
                  {me?.email === user.email && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">you</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {user.role === 'owner' ? (
                    <span className="inline-flex items-center text-xs font-medium text-brass-50">
                      <ShieldCheck size={14} className="mr-1" /> Owner
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600">Staff</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.active ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.role === 'owner' ? (
                    <span className="text-sm text-gray-400">Owner account is protected</span>
                  ) : resetFor === user.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        autoFocus
                        value={resetPin}
                        onChange={(e) => setResetPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="New 6-digit PIN"
                        className="w-36 px-3 py-1.5 border border-gray-300 rounded-lg text-sm tracking-widest"
                      />
                      <button
                        onClick={() => handleResetPin(user.id)}
                        className="px-3 py-1.5 bg-brass-50 text-white rounded-lg text-sm hover:bg-brass-100"
                      >
                        Set
                      </button>
                      <button
                        onClick={() => { setResetFor(null); setResetPin('') }}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setResetFor(user.id)}
                        className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 text-navy-50 hover:bg-blue-50 rounded transition-colors"
                        title="Reset their PIN"
                      >
                        <KeyRound size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                        title={user.active ? 'Deactivate account' : 'Reactivate account'}
                      >
                        <Power size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove account"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminTeam
