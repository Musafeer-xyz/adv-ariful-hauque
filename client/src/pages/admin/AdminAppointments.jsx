import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import { CheckCircle, XCircle, Loader2, Filter } from 'lucide-react'

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await adminAPI.getAppointments(filter)
        setAppointments(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch appointments:', err)
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [filter])

  const handleConfirm = async (id) => {
    try {
      await adminAPI.confirmAppointment(id)
      setAppointments(appointments.map(apt => 
        apt._id === id ? { ...apt, status: 'confirmed', payment_status: 'paid' } : apt
      ))
    } catch (err) {
      console.error('Failed to confirm appointment:', err)
    }
  }

  const handleCancel = async (id) => {
    try {
      await adminAPI.cancelAppointment(id)
      setAppointments(appointments.map(apt => 
        apt._id === id ? { ...apt, status: 'cancelled' } : apt
      ))
    } catch (err) {
      console.error('Failed to cancel appointment:', err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'awaiting': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
        <h1 className="text-3xl font-bold text-navy-50">Appointments</h1>
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-brass-50 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="awaiting">Awaiting</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-50 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Payment Ref</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {appointment.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {appointment.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {appointment.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(appointment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {appointment.time}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="font-mono text-sm">{appointment.paymentRef || appointment.transactionId || appointment.paymentNumber || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPaymentStatusColor(appointment.payment_status)}`}>
                        {appointment.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.status === 'awaiting' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleConfirm(appointment._id)}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Confirm"
                            aria-label="Confirm appointment"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={() => handleCancel(appointment._id)}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Cancel"
                            aria-label="Cancel appointment"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminAppointments
